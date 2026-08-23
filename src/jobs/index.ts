import { jobQueue, JobType } from "./queue";
import { sendBookingConfirmation } from "./handlers/bookingConfirmation.job";
import { notifyEventUpdate } from "./handlers/eventUpdateNotification.job";

/** Called once from index.ts before app.listen() to wire handlers to job types. */
export function registerJobHandlers() {
  jobQueue.register(JobType.BOOKING_CONFIRMATION, sendBookingConfirmation);
  jobQueue.register(JobType.EVENT_UPDATE_NOTIFICATION, notifyEventUpdate);
}
