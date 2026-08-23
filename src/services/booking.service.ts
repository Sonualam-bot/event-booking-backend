import { Event } from "../models/Event.model";
import { Booking } from "../models/Booking.model";
import {
  EventNotFoundError,
  InsufficientTicketsError,
  ForbiddenError,
} from "../errors";

/**
 * Ticket decrement + booking creation must not let two concurrent
 * requests both succeed against the last N tickets. findOneAndUpdate with
 * an availableTickets >= quantity filter is atomic at the DB level — Mongo
 * only applies the $inc if the filter still matches at the moment it runs
 * the update, so a losing request sees a null result instead of racing
 * past zero. A plain "read available, check in JS, then save" would have
 * a TOCTOU gap under concurrent requests.
 */
export async function createBooking(
  customerId: string,
  eventId: string,
  quantity: number,
) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, availableTickets: { $gte: quantity } },
    { $inc: { availableTickets: -quantity } },
    { returnDocument: "after" },
  );

  if (!event) {
    const existing = await Event.findById(eventId);
    if (!existing) throw new EventNotFoundError();
    throw new InsufficientTicketsError(existing.availableTickets);
  }

  return Booking.create({ event: eventId, customer: customerId, quantity });
}

export async function listBookingsForCustomer(customerId: string) {
  return Booking.find({ customer: customerId })
    .populate("event")
    .sort({ createdAt: -1 });
}

export async function listBookingsForEvent(eventId: string, organizerId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw new EventNotFoundError();
  if (event.organizer.toString() !== organizerId) {
    throw new ForbiddenError("You do not own this event");
  }
  return Booking.find({ event: eventId })
    .populate("customer", "email")
    .sort({ createdAt: -1 });
}
