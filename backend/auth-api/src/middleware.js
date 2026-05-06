import { verifyAccessToken } from "./auth.js";
import { findUserById } from "./store.js";
import { ROLES } from "./constants.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing access token." });

  try {
    const payload = verifyAccessToken(token);
    const user = findUserById(payload.sub);
    if (!user || user.isBlocked || !user.isActive) {
      return res.status(401).json({ message: "User access is not allowed." });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated." });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Insufficient permissions." });
    return next();
  };
}

export function managerOrAdmin(req, res, next) {
  return requireRole(ROLES.MANAGER, ROLES.ADMIN)(req, res, next);
}
