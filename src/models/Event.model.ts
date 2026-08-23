import mongoose, { Schema, Document as MongooseDocument, Types } from "mongoose";

/**
 * organizer is the owning user's id — services/event.service.ts checks
 * this on update/delete so an organizer can only manage their own events.
 * availableTickets is decremented atomically at booking time (see
 * services/booking.service.ts) rather than derived from bookings on
 * every read, so a read-heavy events list stays a single-document fetch.
 */
export interface IEvent extends MongooseDocument {
  title: string;
  description: string;
  venue: string;
  startTime: Date;
  totalTickets: number;
  availableTickets: number;
  price: number;
  organizer: Types.ObjectId;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    totalTickets: { type: Number, required: true, min: 1 },
    availableTickets: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
