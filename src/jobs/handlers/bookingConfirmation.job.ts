export interface BookingConfirmationPayload {
  customerEmail: string;
  eventTitle: string;
  quantity: number;
}

/**
 * Stand-in for a real email send — enqueued from
 * services/booking.service.ts right after a booking is persisted.
 */
export function sendBookingConfirmation(payload: BookingConfirmationPayload) {
  console.log(
    `[email] Booking confirmed: ${payload.quantity} ticket(s) for "${payload.eventTitle}" -> sending confirmation to ${payload.customerEmail}`,
  );
}
