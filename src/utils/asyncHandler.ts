import { RequestHandler } from "express";

/**
 * Wraps an async Express handler so a rejected promise reaches
 * middleware/errorHandler.ts via next(err), instead of the request just
 * hanging. Every controller in controllers/ is wrapped in this.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
