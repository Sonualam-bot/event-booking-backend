import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

/**
 * Reads the httpOnly cookie set by controllers/auth.controller.ts's
 * setAuthCookie(), verifies it, and attaches req.userId — scope any new
 * service's queries by this (e.g. `Model.find({ owner: req.userId })`) so
 * each user only ever sees their own data.
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
    };
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
