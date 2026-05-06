import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import "./env.js";
import { ROLE_ORDER, ROLES } from "./constants.js";
import { authApiRoot } from "./paths.js";

const configuredDbFile = process.env.AUTH_DB_FILE;
const dbFile = configuredDbFile ? path.resolve(configuredDbFile) : path.join(authApiRoot, "data", "auth-db.json");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function ensureDb() {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: [], tokens: [], deals: [], nextDealId: 1 }, null, 2));
  }
}

export function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.tokens)) db.tokens = [];
  if (!Array.isArray(db.deals)) db.deals = [];
  if (typeof db.nextDealId !== "number") db.nextDealId = db.deals.length + 1;
  return db;
}

export function writeDb(data) {
  const tempFile = `${dbFile}.${process.pid}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, dbFile);
}

export function listUsers() {
  return readDb().users;
}

export function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return readDb().users.find((user) => user.email === normalized) || null;
}

export function findUserById(id) {
  return readDb().users.find((user) => user.id === id) || null;
}

export function createUser(userInput) {
  const db = readDb();
  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name: userInput.name || "",
    email: normalizeEmail(userInput.email),
    passwordHash: userInput.passwordHash || null,
    role: userInput.role || ROLES.USER,
    isActive: Boolean(userInput.isActive),
    isBlocked: false,
    provider: userInput.provider || "local",
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

export function updateUser(userId, patch) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === userId);
  if (index < 0) return null;
  db.users[index] = {
    ...db.users[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.users[index];
}

export function removeUser(userId) {
  const db = readDb();
  const nextUsers = db.users.filter((user) => user.id !== userId);
  if (nextUsers.length === db.users.length) return false;
  db.users = nextUsers;
  writeDb(db);
  return true;
}

export function createToken(token) {
  const db = readDb();
  db.tokens.push(token);
  writeDb(db);
}

export function findToken(value, type) {
  return readDb().tokens.find((token) => token.value === value && token.type === type) || null;
}

export function deleteToken(value, type) {
  const db = readDb();
  db.tokens = db.tokens.filter((token) => !(token.value === value && token.type === type));
  writeDb(db);
}

export function seedAdminIfMissing({ email, passwordHash, name }) {
  const db = readDb();
  const normalized = normalizeEmail(email);
  const existingAdmin = db.users.find((user) => user.role === ROLES.ADMIN);
  if (existingAdmin) return existingAdmin;

  const existingByEmail = db.users.find((user) => user.email === normalized);
  if (existingByEmail) {
    existingByEmail.role = ROLES.ADMIN;
    existingByEmail.passwordHash = passwordHash;
    existingByEmail.name = name || existingByEmail.name;
    existingByEmail.isActive = true;
    existingByEmail.isBlocked = false;
    existingByEmail.updatedAt = new Date().toISOString();
    writeDb(db);
    return existingByEmail;
  }

  const now = new Date().toISOString();
  const admin = {
    id: randomUUID(),
    name: name || "System Admin",
    email: normalized,
    passwordHash,
    role: ROLES.ADMIN,
    isActive: true,
    isBlocked: false,
    provider: "local",
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(admin);
  writeDb(db);
  return admin;
}

export function assignAdminWithAutoDemotion(targetUserId, actingAdminId) {
  const db = readDb();
  const target = db.users.find((user) => user.id === targetUserId);
  const actingAdmin = db.users.find((user) => user.id === actingAdminId);
  if (!target || !actingAdmin || actingAdmin.role !== ROLES.ADMIN) return null;

  actingAdmin.role = ROLES.MANAGER;
  actingAdmin.updatedAt = new Date().toISOString();
  target.role = ROLES.ADMIN;
  target.updatedAt = new Date().toISOString();
  writeDb(db);
  return { target, actingAdmin };
}

export function isRoleValid(role) {
  return ROLE_ORDER.includes(role);
}

export function createDeal({ buyer, seller, amountLamports, description, depositSignature }) {
  const db = readDb();
  const id = db.nextDealId;
  const now = Math.floor(Date.now() / 1000);
  const deal = {
    id: String(id),
    buyer,
    seller,
    amountLamports,
    description,
    depositSignature: depositSignature || "",
    status: 0,
    createdAt: now,
    completedAt: 0,
  };
  db.deals.push(deal);
  db.nextDealId = id + 1;
  writeDb(db);
  return deal;
}

export function listDeals() {
  return readDb().deals;
}

export function findDealById(id) {
  return readDb().deals.find((deal) => String(deal.id) === String(id)) || null;
}

export function updateDeal(id, patch) {
  const db = readDb();
  const idx = db.deals.findIndex((deal) => String(deal.id) === String(id));
  if (idx < 0) return null;
  db.deals[idx] = { ...db.deals[idx], ...patch };
  writeDb(db);
  return db.deals[idx];
}
