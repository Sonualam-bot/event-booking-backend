import { z } from "zod";

export const createBookingSchema = z.object({
  quantity: z.number().int().positive(),
});
