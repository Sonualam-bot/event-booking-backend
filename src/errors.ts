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
