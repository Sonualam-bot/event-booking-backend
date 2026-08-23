import { Router } from "express";
import {
  signup,
  login,
  logout,
  me,
  guest,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

/**
 * Wiring only. signup/login/logout/guest skip requireAuth — they're what
 * create the session in the first place. /me needs it, since it reads
 * one. See controllers/auth.controller.ts.
 */
const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/guest", guest);
router.get("/me", requireAuth, me);

export default router;
