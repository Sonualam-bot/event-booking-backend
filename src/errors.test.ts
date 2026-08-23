import { describe, it, expect } from "vitest";
import { AppError, EmailAlreadyExistsError } from "./errors";

/**
 * Smoke test for the error-class pattern — mainly so `npm test` has
 * something to run out of the box. Replace/extend once a real project
 * has its own domain logic worth testing.
 */
describe("AppError", () => {
  it("carries a status code through to subclasses", () => {
    const err = new EmailAlreadyExistsError("a@b.com");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain("a@b.com");
  });
});
