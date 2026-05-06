import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { TOKEN_TYPES } from "./constants.js";
import { createToken, deleteToken, findToken } from "./store.js";

const jwtSecret = () => process.env.JWT_SECRET || "dev-jwt-secret-change-me";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    jwtSecret(),
    { expiresIn: "7d" },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret());
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createOneTimeToken({ userId, type, ttlMinutes = 20 }) {
  const value = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  createToken({
    value,
    userId,
    type,
    expiresAt,
    createdAt: new Date().toISOString(),
  });
  return value;
}

export function consumeOneTimeToken({ token, type }) {
  const record = findToken(token, type);
  if (!record) return null;
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    deleteToken(token, type);
    return null;
  }
  deleteToken(token, type);
  return record;
}

export const TokenTypes = TOKEN_TYPES;
