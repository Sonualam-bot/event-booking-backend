import { Response } from "express";
import { createEventSchema, updateEventSchema } from "../validation/event.schema";
import {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../services/event.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/requireAuth";

/**
 * Thin HTTP layer — parse/validate, call services/event.service.ts, shape
 * the response. Routed from routes/event.routes.ts (mounted at /events).
 */

export const create = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = createEventSchema.parse(req.body);
  const event = await createEvent(req.userId!, data);
  res.status(201).json(event);
});

export const list = asyncHandler(async (_req, res) => {
  const events = await listEvents();
  res.json(events);
});

export const getOne = asyncHandler(async (req, res) => {
  const event = await getEventById(req.params.id as string);
  res.json(event);
});

export const update = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const updates = updateEventSchema.parse(req.body);
  const event = await updateEvent(req.params.id as string, req.userId!, updates);
  res.json(event);
});

export const remove = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await deleteEvent(req.params.id as string, req.userId!);
  res.status(204).send();
});
