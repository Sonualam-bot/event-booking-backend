import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export type UserRole = "organizer" | "customer";

/**
 * Auth record, extended with a role for RBAC. Role is fixed at signup and
 * embedded in the JWT (see services/auth.service.ts's generateToken) so
 * requireRole can check it without a DB round trip on every request.
 */
export interface IUser extends MongooseDocument {
  email: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["organizer", "customer"],
      required: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
