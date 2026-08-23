import { z } from "zod";

/**
 * Request-body shapes for controllers/auth.controller.ts's signup/login.
 * Failures land as ZodError, formatted by middleware/errorHandler.ts.
 */

export const signupSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});
