import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  venue: z.string().min(1, "Venue is required"),
  startTime: z.coerce.date(),
  totalTickets: z.number().int().positive(),
  price: z.number().nonnegative(),
});

/** Ticket capacity is intentionally not editable here — resizing capacity after bookings exist would need its own reconciliation logic, out of scope for this assignment. */
export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  startTime: z.coerce.date().optional(),
  price: z.number().nonnegative().optional(),
});
