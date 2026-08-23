import { Response, NextFunction } from "express";
import { AuthedRequest } from "./requireAuth";
import { UserRole } from "../models/User.model";

/**
 * Must run after requireAuth (needs req.role). Route-level RBAC gate;
 * per-resource ownership (e.g. "does this organizer own this event") is
 * a separate, finer-grained check done in the relevant service.
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowed.includes(req.role)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
}
