import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../errors";

/**
 * The one place a thrown error becomes an HTTP response. Knows about
 * errors.ts's AppError family, Zod's validation errors, and Mongoose's
 * CastError (bad ObjectId in a URL) — anything else falls through to a
 * plain 500. Mounted last in index.ts, after every route, since Express
 * only routes errors to middleware registered after the one that called
 * next(err). If a new project adds its own thrown-error type (the way
 * MRPC's calc engine had InvalidDiscountError), give it its own
 * `instanceof` branch here rather than letting it fall through to 500.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
};
