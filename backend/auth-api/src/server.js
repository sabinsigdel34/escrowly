import "./env.js";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import bs58 from "bs58";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createHash } from "node:crypto";
import { setupOauth } from "./oauth.js";
import { ROLES } from "./constants.js";
import { comparePassword, createOneTimeToken, hashPassword, signAccessToken, TokenTypes, consumeOneTimeToken } from "./auth.js";
import {
  assignAdminWithAutoDemotion,
  createDeal,
  createUser,
  findDealById,
  findUserByEmail,
  findUserById,
  isRoleValid,
  listDeals,
  listUsers,
  removeUser,
  seedAdminIfMissing,
  updateDeal,
  updateUser,
} from "./store.js";
import { authRequired, managerOrAdmin, requireRole } from "./middleware.js";
import { createMailer, isMailEnabled, sendEmailOrLog } from "./mailer.js";

const app = express();
const port = Number(process.env.PORT || 5001);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const apiBase = process.env.API_BASE_URL || `http://localhost:${port}`;
const transporter = createMailer();
const solanaRpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const connection = new Connection(solanaRpcUrl, "confirmed");
const escrowMode = process.env.ESCROW_MODE || "custodial";
const escrowProgramId = process.env.SOLANA_ESCROW_PROGRAM_ID || "";

function discriminator(ixName) {
  return createHash("sha256").update(`global:${ixName}`).digest().subarray(0, 8);
}

function startsWithDiscriminator(dataBase58, ixName) {
  if (!dataBase58) return false;
  const data = bs58.decode(dataBase58);
  const expected = discriminator(ixName);
  if (data.length < 8) return false;
  for (let i = 0; i < 8; i += 1) {
    if (data[i] !== expected[i]) return false;
  }
  return true;
}

async function verifyProgramInstruction({ signature, ixName, actorWallet }) {
  if (!escrowProgramId) return false;
  const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx || tx.meta?.err) return false;
  const hasSigner = tx.transaction.message.accountKeys.some((k) => k.pubkey.toBase58() === actorWallet && k.signer);
  if (!hasSigner) return false;
  return tx.transaction.message.instructions.some(
    (ix) => ix.programId?.toBase58?.() === escrowProgramId && startsWithDiscriminator(ix.data, ixName),
  );
}

function parseTreasuryKeypair(secretValue) {
  if (!secretValue) return null;
  try {
    if (secretValue.trim().startsWith("[")) {
      const bytes = Uint8Array.from(JSON.parse(secretValue));
      return Keypair.fromSecretKey(bytes);
    }
    const bytes = bs58.decode(secretValue.trim());
    return Keypair.fromSecretKey(bytes);
  } catch {
    return null;
  }
}

const treasuryKeypair = parseTreasuryKeypair(process.env.SOLANA_TREASURY_SECRET || "");
const treasuryPublicKey = treasuryKeypair
  ? treasuryKeypair.publicKey
  : process.env.SOLANA_TREASURY_PUBLIC_KEY
    ? new PublicKey(process.env.SOLANA_TREASURY_PUBLIC_KEY)
    : null;

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me-session-secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
const oauthProviders = setupOauth();

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isBlocked: user.isBlocked,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function sanitizeUsersForList(users) {
  return users.map((user) => serializeUser(user));
}

function canIssueToken(user) {
  return Boolean(user && user.isActive && !user.isBlocked);
}

function sendAuthResult(res, user) {
  if (!canIssueToken(user)) {
    return res.status(403).json({ message: "User access is not allowed." });
  }
  const token = signAccessToken(user);
  return res.json({ token, user: serializeUser(user) });
}

function redirectWithAuthError(res, error) {
  const target = new URL(frontendUrl);
  target.searchParams.set("oauth_error", error);
  return res.redirect(target.toString());
}

function sendOauthDisabled(provider) {
  return (_req, res) =>
    res.status(503).json({
      message: `${provider} OAuth is not configured on this server.`,
      code: "OAUTH_NOT_CONFIGURED",
    });
}

async function sendActivationEmail(user, token) {
  const activationLink = `${frontendUrl}/?activation_token=${token}`;
  return sendEmailOrLog({
    transporter,
    to: user.email,
    subject: "Activate your Escrowly account",
    text: `Activate your account: ${activationLink}`,
    html: `<p>Welcome to Escrowly.</p><p>Activate your account using this link:</p><p><a href="${activationLink}">${activationLink}</a></p>`,
  });
}

async function sendResetEmail(user, token) {
  const resetLink = `${frontendUrl}/?reset_token=${token}`;
  return sendEmailOrLog({
    transporter,
    to: user.email,
    subject: "Reset your Escrowly password",
    text: `Reset your password: ${resetLink}`,
    html: `<p>Reset your password with the link below:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/auth/providers", (_req, res) => {
  res.json({ providers: oauthProviders });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) return res.status(400).json({ message: "Email and password are required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (findUserByEmail(normalizedEmail)) return res.status(409).json({ message: "Email already registered." });

  const passwordHash = await hashPassword(password);
  const user = createUser({
    name: name || "",
    email: normalizedEmail,
    passwordHash,
    role: ROLES.USER,
    isActive: false,
  });
  const activationToken = createOneTimeToken({
    userId: user.id,
    type: TokenTypes.ACTIVATION,
    ttlMinutes: 60 * 24,
  });
  const mailResult = await sendActivationEmail(user, activationToken);

  const response = { message: "Registration successful. Check your email to activate your account." };
  if (!mailResult?.delivered) {
    response.message = "Registration successful. Email delivery is not configured — use the activation token below to activate your account.";
    response.activationToken = activationToken;
    response.mailDisabled = true;
  }
  return res.status(201).json(response);
});

app.post("/auth/activate", (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ message: "Activation token is required." });
  const record = consumeOneTimeToken({ token, type: TokenTypes.ACTIVATION });
  if (!record) return res.status(400).json({ message: "Invalid or expired activation token." });
  const user = findUserById(record.userId);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isBlocked) return res.status(403).json({ message: "User access is blocked." });

  const nextUser = updateUser(user.id, { isActive: true });
  return sendAuthResult(res, nextUser);
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email || "");
  if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials." });
  const ok = await comparePassword(password || "", user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials." });
  if (user.isBlocked) return res.status(403).json({ message: "Your account is blocked." });
  if (!user.isActive) {
    const activationToken = createOneTimeToken({
      userId: user.id,
      type: TokenTypes.ACTIVATION,
      ttlMinutes: 60 * 24,
    });
    const mailResult = await sendActivationEmail(user, activationToken);
    const response = {
      message: "Account is not active. We sent a new activation email.",
      code: "ACCOUNT_INACTIVE",
      nextSection: "activate",
    };
    if (!mailResult?.delivered) {
      response.message = "Account is not active. Email delivery is not configured — use the activation token below to activate your account.";
      response.activationToken = activationToken;
      response.mailDisabled = true;
    }
    return res.status(403).json(response);
  }
  return sendAuthResult(res, user);
});

app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const user = findUserByEmail(email || "");
  if (user) {
    const resetToken = createOneTimeToken({
      userId: user.id,
      type: TokenTypes.RESET_PASSWORD,
      ttlMinutes: 30,
    });
    const mailResult = await sendResetEmail(user, resetToken);
    const response = { message: "If that email exists, a reset link has been sent." };
    if (!mailResult?.delivered) {
      response.message = "Email delivery is not configured — use the reset token below to reset your password.";
      response.resetToken = resetToken;
      response.mailDisabled = true;
    }
    return res.json(response);
  }
  return res.json({ message: "If that email exists, a reset link has been sent." });
});

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: "Token and new password are required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

  const record = consumeOneTimeToken({ token, type: TokenTypes.RESET_PASSWORD });
  if (!record) return res.status(400).json({ message: "Invalid or expired reset token." });
  const user = findUserById(record.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  const passwordHash = await hashPassword(password);
  updateUser(user.id, { passwordHash, isActive: true });
  return res.json({ message: "Password updated successfully." });
});

if (oauthProviders.google) {
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${frontendUrl}/?oauth_error=google` }),
    (req, res) => {
      if (!canIssueToken(req.user)) return redirectWithAuthError(res, "google_access_denied");
      const token = signAccessToken(req.user);
      const target = new URL(frontendUrl);
      target.searchParams.set("oauth_token", token);
      return res.redirect(target.toString());
    },
  );
} else {
  app.get("/auth/google", sendOauthDisabled("Google"));
  app.get("/auth/google/callback", (_req, res) => redirectWithAuthError(res, "google_not_configured"));
}

if (oauthProviders.github) {
  app.get("/auth/github", passport.authenticate("github", { session: false, scope: ["user:email"] }));
  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: `${frontendUrl}/?oauth_error=github` }),
    (req, res) => {
      if (!canIssueToken(req.user)) return redirectWithAuthError(res, "github_access_denied");
      const token = signAccessToken(req.user);
      const target = new URL(frontendUrl);
      target.searchParams.set("oauth_token", token);
      return res.redirect(target.toString());
    },
  );
} else {
  app.get("/auth/github", sendOauthDisabled("GitHub"));
  app.get("/auth/github/callback", (_req, res) => redirectWithAuthError(res, "github_not_configured"));
}

app.get("/auth/me", authRequired, (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

app.get("/deals", authRequired, (req, res) => {
  const deals = listDeals().slice().reverse();
  res.json({ deals });
});

app.get("/deals/:id", authRequired, (req, res) => {
  const deal = findDealById(req.params.id);
  if (!deal) return res.status(404).json({ message: "Deal not found." });
  return res.json({ deal });
});

app.post("/deals", authRequired, async (req, res) => {
  const { buyerWallet, seller, amountSol, description, depositSignature } = req.body || {};
  const amount = Number(amountSol);
  if (!buyerWallet || !seller || !description || !depositSignature) return res.status(400).json({ message: "Missing deal fields." });
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "Amount must be greater than zero." });
  if (escrowMode !== "program" && !treasuryPublicKey) {
    return res.status(500).json({ message: "Treasury wallet is not configured." });
  }

  const amountLamports = Math.round(amount * LAMPORTS_PER_SOL);
  if (escrowMode === "program") {
    return res.status(400).json({ message: "Use /deals/sync-create for program mode." });
  }
  const transferIsValid = async () => {
    const tx = await connection.getParsedTransaction(depositSignature, { maxSupportedTransactionVersion: 0 });
    if (!tx || tx.meta?.err) return false;
    const instructions = tx.transaction.message.instructions || [];
    return instructions.some((ix) => {
      const parsed = ix?.parsed;
      if (!parsed || parsed.type !== "transfer" || !parsed.info) return false;
      const sourceOk = parsed.info.source === buyerWallet;
      const destinationOk = parsed.info.destination === treasuryPublicKey.toBase58();
      const amountOk = Number(parsed.info.lamports) >= amountLamports;
      return sourceOk && destinationOk && amountOk;
    });
  };

  if (!(await transferIsValid())) {
    return res.status(400).json({ message: "Deposit transaction verification failed." });
  }

  const deal = createDeal({
    buyer: buyerWallet,
    seller,
    amountLamports,
    description,
    depositSignature,
  });
  return res.status(201).json({ deal });
});

app.post("/deals/sync-create", authRequired, async (req, res) => {
  const { buyerWallet, seller, amountSol, description, createSignature } = req.body || {};
  const amount = Number(amountSol);
  if (!buyerWallet || !seller || !description || !createSignature) return res.status(400).json({ message: "Missing deal fields." });
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "Amount must be greater than zero." });
  if (escrowMode !== "program") return res.status(400).json({ message: "Program mode is not enabled." });

  const valid = await verifyProgramInstruction({
    signature: createSignature,
    ixName: "initialize_deal",
    actorWallet: buyerWallet,
  });
  if (!valid) return res.status(400).json({ message: "Program create transaction verification failed." });

  const deal = createDeal({
    buyer: buyerWallet,
    seller,
    amountLamports: Math.round(amount * LAMPORTS_PER_SOL),
    description,
    depositSignature: createSignature,
  });
  return res.status(201).json({ deal });
});

app.post("/deals/:id/release", authRequired, async (req, res) => {
  const { actorWallet, actionSignature } = req.body || {};
  const deal = findDealById(req.params.id);
  if (!deal) return res.status(404).json({ message: "Deal not found." });
  if (deal.status !== 0) return res.status(400).json({ message: "Deal cannot be released." });
  if (actorWallet !== deal.buyer && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: "Only buyer or admin can release payment." });
  }
  if (escrowMode === "program") {
    const valid = await verifyProgramInstruction({
      signature: actionSignature,
      ixName: "release_payment",
      actorWallet,
    });
    if (!valid) return res.status(400).json({ message: "Release transaction verification failed." });
    const updated = updateDeal(deal.id, {
      status: 1,
      completedAt: Math.floor(Date.now() / 1000),
      releaseSignature: actionSignature,
    });
    return res.json({ deal: updated });
  }

  if (!treasuryKeypair) return res.status(500).json({ message: "Treasury signer is not configured." });
  const destination = new PublicKey(deal.seller);
  try {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: destination,
        lamports: Number(deal.amountLamports),
      }),
    );
    const signature = await sendAndConfirmTransaction(connection, tx, [treasuryKeypair]);
    const updated = updateDeal(deal.id, {
      status: 1,
      completedAt: Math.floor(Date.now() / 1000),
      releaseSignature: signature,
    });
    return res.json({ deal: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Release transfer failed." });
  }
});

app.post("/deals/:id/cancel", authRequired, async (req, res) => {
  const { actorWallet, actionSignature } = req.body || {};
  const deal = findDealById(req.params.id);
  if (!deal) return res.status(404).json({ message: "Deal not found." });
  if (deal.status !== 0) return res.status(400).json({ message: "Deal cannot be cancelled." });
  if (actorWallet !== deal.seller && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: "Only seller or admin can request cancellation." });
  }
  if (escrowMode === "program") {
    const valid = await verifyProgramInstruction({
      signature: actionSignature,
      ixName: "request_cancellation",
      actorWallet,
    });
    if (!valid) return res.status(400).json({ message: "Cancellation transaction verification failed." });
  }
  const updated = updateDeal(deal.id, { status: 2, cancelSignature: actionSignature || "" });
  return res.json({ deal: updated });
});

app.post("/deals/:id/refund", authRequired, async (req, res) => {
  const { actorWallet, actionSignature } = req.body || {};
  const deal = findDealById(req.params.id);
  if (!deal) return res.status(404).json({ message: "Deal not found." });
  if (deal.status !== 2) return res.status(400).json({ message: "Refund is not available." });
  if (actorWallet !== deal.buyer && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: "Only buyer or admin can approve refund." });
  }
  if (escrowMode === "program") {
    const valid = await verifyProgramInstruction({
      signature: actionSignature,
      ixName: "approve_refund",
      actorWallet,
    });
    if (!valid) return res.status(400).json({ message: "Refund transaction verification failed." });
    const updated = updateDeal(deal.id, {
      status: 3,
      completedAt: Math.floor(Date.now() / 1000),
      refundSignature: actionSignature,
    });
    return res.json({ deal: updated });
  }

  if (!treasuryKeypair) return res.status(500).json({ message: "Treasury signer is not configured." });
  const destination = new PublicKey(deal.buyer);
  try {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryKeypair.publicKey,
        toPubkey: destination,
        lamports: Number(deal.amountLamports),
      }),
    );
    const signature = await sendAndConfirmTransaction(connection, tx, [treasuryKeypair]);
    const updated = updateDeal(deal.id, {
      status: 3,
      completedAt: Math.floor(Date.now() / 1000),
      refundSignature: signature,
    });
    return res.json({ deal: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Refund transfer failed." });
  }
});

app.get("/admin/users", authRequired, managerOrAdmin, (_req, res) => {
  const users = listUsers();
  res.json({ users: sanitizeUsersForList(users) });
});

app.patch("/admin/users/:id/role", authRequired, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!isRoleValid(role)) return res.status(400).json({ message: "Invalid role value." });
  if (id === req.user.id && role !== ROLES.ADMIN) {
    return res.status(400).json({ message: "Use transfer-admin workflow to demote current admin." });
  }

  const target = findUserById(id);
  if (!target) return res.status(404).json({ message: "User not found." });
  const updated = updateUser(id, { role });
  return res.json({ user: serializeUser(updated) });
});

app.post("/admin/transfer-admin/:id", authRequired, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  const result = assignAdminWithAutoDemotion(id, req.user.id);
  if (!result) return res.status(400).json({ message: "Cannot transfer admin role." });
  return res.json({
    message: "Admin role transferred. Previous admin is now manager.",
    newAdmin: serializeUser(result.target),
    previousAdmin: serializeUser(result.actingAdmin),
  });
});

app.patch("/admin/users/:id/block", authRequired, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ message: "Admin cannot block self." });
  const target = findUserById(id);
  if (!target) return res.status(404).json({ message: "User not found." });
  const updated = updateUser(id, { isBlocked: true });
  return res.json({ user: serializeUser(updated) });
});

app.patch("/admin/users/:id/unblock", authRequired, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  const target = findUserById(id);
  if (!target) return res.status(404).json({ message: "User not found." });
  const updated = updateUser(id, { isBlocked: false });
  return res.json({ user: serializeUser(updated) });
});

app.delete("/admin/users/:id", authRequired, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ message: "Admin cannot delete self." });
  const ok = removeUser(id);
  if (!ok) return res.status(404).json({ message: "User not found." });
  return res.json({ message: "User removed." });
});

const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "sabinsigdel80@gmail.com";
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "sabin12345";
const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || "Sabin";

const passwordHash = await hashPassword(defaultAdminPassword);
seedAdminIfMissing({
  email: defaultAdminEmail,
  passwordHash,
  name: defaultAdminName,
});

app.listen(port, () => {
  console.log(`Auth API listening on ${apiBase}`);
  if (!isMailEnabled(transporter)) {
    console.warn(`[MAIL] SMTP is not configured (SMTP_USER/SMTP_PASS missing). Activation and reset tokens will be returned in API responses instead of being emailed.`);
  } else {
    console.log(`[MAIL] SMTP is configured. Emails will be sent via ${process.env.SMTP_USER}.`);
  }
});
