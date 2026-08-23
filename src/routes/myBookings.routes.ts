import { Router } from "express";
import { listMine } from "../controllers/booking.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

/** Mounted at /bookings — a customer's view across all events, separate from the per-event listing organizers get at /events/:id/bookings. */
const router = Router();

router.get("/me", requireAuth, requireRole("customer"), listMine);

export default router;
