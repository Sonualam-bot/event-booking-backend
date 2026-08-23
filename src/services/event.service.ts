import { Event } from "../models/Event.model";
import { EventNotFoundError, ForbiddenError } from "../errors";
import { updateEventSchema } from "../validation/event.schema";
import { z } from "zod";

/**
 * Business logic for events. Ownership (an organizer can only touch
 * their own events) is enforced here, not in routes/controllers, so it
 * can't be bypassed by adding a new route that forgets the check.
 */

export async function createEvent(
  organizerId: string,
  data: {
    title: string;
    description: string;
    venue: string;
    startTime: Date;
    totalTickets: number;
    price: number;
  },
) {
  return Event.create({
    ...data,
    availableTickets: data.totalTickets,
    organizer: organizerId,
  });
}

export async function listEvents() {
  return Event.find().sort({ startTime: 1 });
}

export async function getEventById(eventId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw new EventNotFoundError();
  return event;
}

function assertOwnsEvent(
  event: { organizer: { toString(): string } },
  organizerId: string,
) {
  if (event.organizer.toString() !== organizerId) {
    throw new ForbiddenError("You do not own this event");
  }
}

export async function updateEvent(
  eventId: string,
  organizerId: string,
  updates: z.infer<typeof updateEventSchema>,
) {
  const event = await getEventById(eventId);
  assertOwnsEvent(event, organizerId);

  Object.assign(event, updates);
  await event.save();

  return event;
}

export async function deleteEvent(eventId: string, organizerId: string) {
  const event = await getEventById(eventId);
  assertOwnsEvent(event, organizerId);
  await event.deleteOne();
}
