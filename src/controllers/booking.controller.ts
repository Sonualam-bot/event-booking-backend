import { Response } from "express";
import { createBookingSchema } from "../validation/booking.schema";
import {
  createBooking,
  listBookingsForCustomer,
  listBookingsForEvent,
} from "../services/booking.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/requireAuth";

/**
 * Thin HTTP layer — parse/validate, call services/booking.service.ts,
 * shape the response. Routed from routes/booking.routes.ts.
 */

export const create = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { quantity } = createBookingSchema.parse(req.body);
  const booking = await createBooking(req.userId!, req.params.eventId as string, quantity);
  res.status(201).json(booking);
});

export const listMine = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const bookings = await listBookingsForCustomer(req.userId!);
  res.json(bookings);
});

export const listForEvent = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const bookings = await listBookingsForEvent(req.params.eventId as string, req.userId!);
  res.json(bookings);
});
