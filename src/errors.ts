/**
 * Domain errors, one per case that needs a specific HTTP status.
 * Thrown from services/*.ts, caught in exactly one place —
 * middleware/errorHandler.ts — so nothing in services/ or controllers/
 * ever touches res.status() directly. Add your own subclasses here as a
 * new project grows domain-specific error cases beyond auth.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`An account with email "${email}" already exists`, 409);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password", 401);
  }
}

export class SessionUserNotFoundError extends AppError {
  constructor() {
    super("Not authenticated", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403);
  }
}

export class EventNotFoundError extends AppError {
  constructor() {
    super("Event not found", 404);
  }
}

export class InsufficientTicketsError extends AppError {
  constructor(available: number) {
    super(`Only ${available} ticket(s) left for this event`, 409);
  }
}
