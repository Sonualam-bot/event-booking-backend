import { Router } from "express";
import { create, list, getOne, update, remove } from "../controllers/event.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import bookingRouter from "./booking.routes";

/**
 * Browsing (list/getOne) is open to any authenticated user, organizer or
 * customer. Writes are organizer-only at the route level; per-event
 * ownership is checked in services/event.service.ts.
 */
const router = Router();

router.use(requireAuth);

router.post("/", requireRole("organizer"), create);
router.get("/", list);
router.get("/:id", getOne);
router.put("/:id", requireRole("organizer"), update);
router.delete("/:id", requireRole("organizer"), remove);

router.use("/:eventId/bookings", bookingRouter);

export default router;
