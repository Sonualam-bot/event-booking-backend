import { Router } from "express";
import { create, listForEvent } from "../controllers/booking.controller";
import { requireRole } from "../middleware/requireRole";

/**
 * Mounted at /events/:eventId/bookings (mergeParams so req.params.eventId
 * is visible here). requireAuth already ran on the parent event router.
 */
const router = Router({ mergeParams: true });

router.post("/", requireRole("customer"), create);
router.get("/", requireRole("organizer"), listForEvent);

export default router;
