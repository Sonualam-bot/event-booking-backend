import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User.model";

export interface AuthedRequest extends Request {
  userId?: string;
  role?: UserRole;
}

/**
 * Reads the httpOnly cookie set by controllers/auth.controller.ts's
 * setAuthCookie(), verifies it, and attaches req.userId/req.role — scope
 * any new service's queries by userId (e.g. `Model.find({ owner: req.userId })`)
 * so each user only ever sees their own data. role rides in the token
 * itself (see services/auth.service.ts's generateToken) rather than a
 * fresh DB lookup, so requireRole below stays a pure in-memory check.
 */
export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: UserRole;
    };
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
