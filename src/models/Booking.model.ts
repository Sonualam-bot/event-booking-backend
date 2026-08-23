import mongoose, { Schema, Document as MongooseDocument, Types } from "mongoose";

/**
 * One row per booking action (not one row per ticket) — quantity holds
 * the ticket count. customer scopes "my bookings"; event is used both to
 * list an organizer's attendees and to resolve who to notify on
 * update (jobs/handlers/eventUpdateNotification.job.ts).
 */
export interface IBooking extends MongooseDocument {
  event: Types.ObjectId;
  customer: Types.ObjectId;
  quantity: number;
}

const bookingSchema = new Schema<IBooking>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
