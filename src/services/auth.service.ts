import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.model";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  SessionUserNotFoundError,
} from "../errors";

/**
 * Signup/login logic — hashing, credential checks, token issuing.
 * Called from controllers/auth.controller.ts; thrown errors are the
 * classes in ../errors.ts, caught centrally by middleware/errorHandler.ts.
 */

const SALT_ROUNDS = 10;

export async function createUser(email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new EmailAlreadyExistsError(email);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ email, passwordHash });
}

/**
 * Backs a "Continue as guest" button — generates a throwaway account with
 * a random email/password and creates it through the normal createUser()
 * path (same hashing, same uniqueness check, no duplicated logic). A
 * fresh account per click, not one shared demo login, so two people
 * trying the app at the same time never see each other's data, and
 * there's nothing to seed in a freshly deployed database. Delete this
 * function (and its route/controller) if a given project doesn't want
 * guest access.
 */
export async function createGuestUser() {
  const id = crypto.randomUUID();
  const email = `guest-${id}@demo.local`;
  const password = crypto.randomUUID();
  return createUser(email, password);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new InvalidCredentialsError();

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw new InvalidCredentialsError();

  return user;
}

/**
 * Payload is just the id on purpose — JWTs are signed, not encrypted, so
 * nothing sensitive belongs in here. Verified by middleware/requireAuth.ts.
 */
export function generateToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new SessionUserNotFoundError();
  return user;
}
