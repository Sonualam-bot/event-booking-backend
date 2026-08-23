import { Booking } from "../../models/Booking.model";
import { User } from "../../models/User.model";

export interface EventUpdateNotificationPayload {
  eventId: string;
  eventTitle: string;
}

/**
 * Enqueued from services/event.service.ts after an update is persisted.
 * Looks up every distinct customer who booked this event and logs a
 * notification for each — the DB read happens here, off the request
 * path, so updating an event stays a single fast write for the caller.
 */
export async function notifyEventUpdate(
  payload: EventUpdateNotificationPayload,
) {
  const customerIds = await Booking.distinct("customer", {
    event: payload.eventId,
  });
  if (customerIds.length === 0) return;

  const customers = await User.find({ _id: { $in: customerIds } });
  for (const customer of customers) {
    console.log(
      `[notification] Event "${payload.eventTitle}" was updated -> notifying ${customer.email}`,
    );
  }
}
