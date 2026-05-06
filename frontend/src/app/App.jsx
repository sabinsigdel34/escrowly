import React, { Suspense, lazy, useEffect, useState } from "react";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Shield, Wallet, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AnimatedCursor } from "../components/cursor/AnimatedCursor";
import { SmoothScroll } from "../components/SmoothScroll";
import { AppShell } from "../components/layout/AppShell";
import { IconButton } from "../components/ui/IconButton";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Toast } from "../components/ui/Toast";
import { AuthDashboard } from "../auth/AuthDashboard";
import { authApi } from "../auth/api";
import { getErrorMessage, sameAddress, shortAddress } from "../lib/format";
import { getAdminStats, normalizeDeal } from "../lib/escrow";
import { approveRefundTx, initializeDealTx, releasePaymentTx, requestCancellationTx } from "../lib/solanaEscrowProgram";

const LandingPage = lazy(() => import("../landing/LandingPage").then((m) => ({ default: m.LandingPage })));
const AdminDashboard = lazy(() => import("../dashboard/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const BuyerDashboard = lazy(() => import("../dashboard/BuyerDashboard").then((m) => ({ default: m.BuyerDashboard })));

const solanaNetwork = import.meta.env.VITE_SOLANA_NETWORK || "devnet";
const escrowProgramId = import.meta.env.VITE_SOLANA_ESCROW_PROGRAM || "";
const solanaRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork);

const navItems = [
  { id: "landing", label: "Service" },
  { id: "auth", label: "Auth" },
  { id: "buyer", label: "Buyer Dashboard" },
  { id: "admin", label: "Admin" },
];
const AUTH_TOKEN_KEY = "escrowly-auth-token";
const AUTH_SESSIONS_KEY = "escrowly-auth-sessions";

function readStoredSessions() {
  try {
    const raw = localStorage.getItem(AUTH_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry?.email && entry?.token);
  } catch {
    return [];
  }
}

export function App() {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState("landing");
  const [theme, setTheme] = useState(() => localStorage.getItem("escrowly-theme") || "dark");
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [balance, setBalance] = useState("");
  const [dealId, setDealId] = useState("1");
  const [deal, setDeal] = useState(null);
  const [adminDeals, setAdminDeals] = useState([]);
  const [adminLoadedAt, setAdminLoadedAt] = useState("");
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [description, setDescription] = useState("Website escrow");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || "");
  const [authUser, setAuthUser] = useState(null);
  const [authSessions, setAuthSessions] = useState(() => readStoredSessions());
  const [urlResetToken, setUrlResetToken] = useState("");

  const persistSessions = (nextSessions) => {
    setAuthSessions(nextSessions);
    localStorage.setItem(AUTH_SESSIONS_KEY, JSON.stringify(nextSessions));
  };

  const handleAuthSuccess = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthSessions((prev) => {
      const withoutCurrent = prev.filter((entry) => entry.email !== user.email);
      const next = [{ email: user.email, token }, ...withoutCurrent].slice(0, 8);
      localStorage.setItem(AUTH_SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const switchAuthSession = (nextToken) => {
    setAuthToken(nextToken);
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setView("auth");
  };

  const removeAuthSession = (emailToRemove) => {
    const nextSessions = authSessions.filter((entry) => entry.email !== emailToRemove);
    persistSessions(nextSessions);
    if (authUser?.email === emailToRemove) {
      setAuthToken("");
      setAuthUser(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  };

  const handleLaunchRequest = () => {
    if (!authToken || !authUser) {
      setNotice("Please login or signup first to launch the app.");
      setView("auth");
      return;
    }
    setView("buyer");
  };

  const hasWallet = typeof window !== "undefined" && Boolean(window.solana);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("escrowly-theme", next);
  };

  async function refreshWallet() {
    if (!window.solana) return;
    try {
      const response = await window.solana.connect({ onlyIfTrusted: true });
      const walletAddress = response?.publicKey?.toString() || "";
      if (walletAddress) {
        setAccount(walletAddress);
        setChainId(solanaNetwork);
        setBalance("Connected");
        return;
      }
    } catch {
      // not trusted yet
    }
    setAccount("");
    setBalance("");
    setChainId("");
  }

  async function connectWallet() {
    setError("");
    if (!hasWallet) {
      setError("Phantom wallet is not available in this browser.");
      return;
    }
    const response = await window.solana.connect();
    setAccount(response.publicKey.toString());
    setChainId(solanaNetwork);
    setBalance("Connected");
  }

  async function disconnectWallet() {
    setError("");
    setNotice("");

    try {
      if (window.solana?.disconnect) {
        await window.solana.disconnect();
      }
    } catch {
      // Disconnect may not be supported by all wallet providers.
    }

    setAccount("");
    setBalance("");
    setChainId("");
    setDeal(null);
    setNotice("Wallet disconnected. Connect again and choose another account.");
  }

  async function loadDeal(id = dealId) {
    setError("");
    setNotice("");
    if (!authToken) {
      setError("Please login first.");
      return;
    }
    if (!id || Number(id) <= 0) {
      setError("Enter a valid deal ID.");
      return;
    }

    try {
      setBusy("load");
      const result = await authApi.getDeal(authToken, id);
      setDeal(normalizeDeal(id, result.deal));
    } catch (err) {
      setDeal(null);
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function loadAdminDeals() {
    setError("");
    setNotice("");
    if (!authToken) {
      setError("Please login first.");
      return;
    }

    try {
      setBusy("admin");
      const result = await authApi.listDeals(authToken);
      setAdminDeals(result.deals.map((row) => normalizeDeal(row.id, row)));
      setAdminLoadedAt(new Date().toLocaleTimeString());
      setNotice(`Loaded ${result.deals.length} deal${result.deals.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function createDeal(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      setBusy("create");
      if (!authToken) throw new Error("Please login first.");
      if (!account) throw new Error("Connect Phantom wallet first.");
      if (!escrowProgramId) throw new Error("Set VITE_SOLANA_ESCROW_PROGRAM in frontend env.");
      const connection = new Connection(solanaRpcUrl, "confirmed");
      const lamports = Math.round(Number(amount) * LAMPORTS_PER_SOL);
      if (!Number.isFinite(lamports) || lamports <= 0) throw new Error("Enter valid SOL amount.");

      const { signature } = await initializeDealTx({
        connection,
        programId: escrowProgramId,
        buyer: account,
        seller,
        amountLamports: lamports,
        description,
      });

      const result = await authApi.syncCreateDeal(authToken, {
        buyerWallet: account,
        seller,
        amountSol: amount,
        description,
        createSignature: signature,
      });
      const newDealId = result.deal.id;
      setDealId(newDealId);
      setNotice(`Deal #${newDealId} created.`);
      await loadDeal(newDealId);
      await refreshWallet();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function runDealAction(action, label) {
    setError("");
    setNotice("");

    try {
      setBusy(action);
      if (!authToken) throw new Error("Please login first.");
      if (!account) throw new Error("Connect Phantom wallet first.");
      const connection = new Connection(solanaRpcUrl, "confirmed");
      let actionSignature = "";
      if (action === "releasePayment") {
        const tx = await releasePaymentTx({
          connection,
          programId: escrowProgramId,
          buyer: account,
          seller: deal.seller,
        });
        actionSignature = tx.signature;
        await authApi.releaseDeal(authToken, deal.id, { actorWallet: account, actionSignature });
      } else if (action === "requestCancellation") {
        const tx = await requestCancellationTx({
          connection,
          programId: escrowProgramId,
          buyer: deal.buyer,
          seller: account,
        });
        actionSignature = tx.signature;
        await authApi.cancelDeal(authToken, deal.id, { actorWallet: account, actionSignature });
      } else if (action === "approveRefund") {
        const tx = await approveRefundTx({
          connection,
          programId: escrowProgramId,
          buyer: account,
          seller: deal.seller,
        });
        actionSignature = tx.signature;
        await authApi.refundDeal(authToken, deal.id, { actorWallet: account, actionSignature });
      } else {
        throw new Error("Unsupported action.");
      }
      setNotice(label);
      await loadDeal(deal.id);
      await refreshWallet();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function copyAddress(value) {
    await navigator.clipboard.writeText(value);
    setNotice("Address copied.");
  }

  useEffect(() => {
    refreshWallet();
    if (!window.solana) return undefined;

    const handleAccountChange = () => refreshWallet();
    window.solana.on?.("accountChanged", handleAccountChange);
    return () => {
      window.solana.removeListener?.("accountChanged", handleAccountChange);
    };
  }, []);

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauth_token");
    const activationToken = params.get("activation_token");
    const resetToken = params.get("reset_token");
    const oauthError = params.get("oauth_error");
    if (!oauthToken && !activationToken && !resetToken && !oauthError) return;

    const run = async () => {
      try {
        if (oauthError) {
          setView("auth");
          setError("OAuth sign-in was not completed.");
        } else if (oauthToken) {
          const me = await authApi.me(oauthToken);
          handleAuthSuccess({ token: oauthToken, user: me.user });
          setNotice("OAuth login successful.");
          setView("auth");
        } else if (activationToken) {
          const result = await authApi.activate(activationToken);
          handleAuthSuccess(result);
          setNotice("Account activated successfully.");
          setView("auth");
        } else if (resetToken) {
          setUrlResetToken(resetToken);
          setView("auth");
          setNotice("Reset token found. Use Auth tab to set a new password.");
        }
      } catch (err) {
        setError(err.message || "Authentication callback failed.");
      } finally {
        const clean = new URL(window.location.href);
        clean.searchParams.delete("oauth_token");
        clean.searchParams.delete("activation_token");
        clean.searchParams.delete("reset_token");
        clean.searchParams.delete("oauth_error");
        window.history.replaceState({}, "", clean.toString());
      }
    };

    run();
  }, []);

  useEffect(() => {
    if (!authToken) {
      setAuthUser(null);
      if (view === "buyer") {
        setView("auth");
        setNotice("Please login or signup first to launch the app.");
      }
      return;
    }
    authApi
      .me(authToken)
      .then((res) => setAuthUser(res.user))
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken("");
        setAuthUser(null);
      });
  }, [authToken]);

  const isBuyer = sameAddress(account, deal?.buyer);
  const isSeller = sameAddress(account, deal?.seller);
  const funded = deal?.status === 0;
  const cancelRequested = deal?.status === 2;
  const adminStats = getAdminStats(adminDeals);

  const transitionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14, scale: 0.995, filter: "blur(3px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, scale: 0.998, filter: "blur(3px)" },
        transition: { duration: 0.28, ease: [0.16, 0.84, 0.44, 1] },
      };

  return (
    <main className={`min-h-screen overflow-hidden bg-ink text-zinc-100 ${theme} ${view === "landing" ? "escrowly-page" : ""}`}>
      <AnimatedCursor />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} {...transitionProps}>
          {view === "landing" ? (
            <SmoothScroll>
              <Suspense fallback={<div className="min-h-screen bg-ink" />}>
                <LandingPage onStart={handleLaunchRequest} onAdmin={() => setView("admin")} theme={theme} toggleTheme={toggleTheme} />
              </Suspense>
            </SmoothScroll>
          ) : (
            <>
              <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,4,41,0.10),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(239,35,60,0.06),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:auto,auto,30px_30px]" />
              <AppShell>
                <header className="flex flex-col gap-4 border-b border-zinc-900 pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md border border-ember-700 bg-ember-600/15">
                      <Shield className="h-6 w-6 text-ember-500" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-normal text-white">Escrowly</h1>
                      <p className="text-sm text-zinc-400">Contract-held settlement for digital deals</p>
                    </div>
                  </div>

                  <nav className="flex w-full gap-2 overflow-x-auto rounded-md border border-zinc-900 bg-black/50 p-1 lg:w-auto">
                    {navItems.map((item) => (
                      <motion.button
                        key={item.id}
                        className={`h-10 shrink-0 rounded-md px-4 text-sm font-semibold transition ${
                          view === item.id ? "bg-ember-600 text-white shadow-redline" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        }`}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                        transition={prefersReducedMotion ? undefined : { duration: 0.14, ease: "easeOut" }}
                        onClick={() => {
                          if (item.id === "buyer") {
                            handleLaunchRequest();
                            return;
                          }
                          setView(item.id);
                        }}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </nav>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
                    <IconButton onClick={toggleTheme} label="Toggle theme">
                      <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`} />
                    </IconButton>

                    {account ? (
                      <div className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-medium">{shortAddress(account)}</span>
                        <span className="text-zinc-500">{balance}</span>
                      </div>
                    ) : null}

                    {account ? (
                      <SecondaryButton icon={X} onClick={disconnectWallet}>
                        Disconnect
                      </SecondaryButton>
                    ) : (
                      <PrimaryButton icon={Wallet} onClick={connectWallet}>
                        Connect Wallet
                      </PrimaryButton>
                    )}
                  </div>
                </header>

                <Suspense fallback={<div className="h-56 rounded-xl border border-zinc-800 bg-zinc-900/40" />}>
                  {view === "buyer" ? (
                    <BuyerDashboard
                      account={account}
                      busy={busy}
                      cancelRequested={cancelRequested}
                      chainId={chainId}
                      contractAddress={escrowProgramId}
                      copyAddress={copyAddress}
                      createDeal={createDeal}
                      deal={deal}
                      dealId={dealId}
                      description={description}
                      funded={funded}
                      isBuyer={isBuyer}
                      isSeller={isSeller}
                      loadDeal={loadDeal}
                      amount={amount}
                      runDealAction={runDealAction}
                      seller={seller}
                      setAmount={setAmount}
                      setDealId={setDealId}
                      setDescription={setDescription}
                      setSeller={setSeller}
                    />
                  ) : null}

                  {view === "auth" ? (
                    <AuthDashboard
                      token={authToken}
                      user={authUser}
                      authSessions={authSessions}
                      onAuthSuccess={handleAuthSuccess}
                      onSwitchSession={switchAuthSession}
                      onRemoveSession={removeAuthSession}
                      setToken={setAuthToken}
                      setUser={setAuthUser}
                      setNotice={setNotice}
                      setError={setError}
                      initialResetToken={urlResetToken}
                    />
                  ) : null}

                  {view === "admin" ? (
                    <AdminDashboard
                      adminDeals={adminDeals}
                      adminLoadedAt={adminLoadedAt}
                      adminStats={adminStats}
                      busy={busy}
                      contractAddress={escrowProgramId}
                      loadAdminDeals={loadAdminDeals}
                      setDealId={setDealId}
                      setView={setView}
                    />
                  ) : null}
                </Suspense>
              </AppShell>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <Toast kind={error ? "error" : "success"} message={error || notice} onClear={() => (error ? setError("") : setNotice(""))} />
    </main>
  );
}
