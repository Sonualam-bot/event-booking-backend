import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

/**
 * Auth-only record — nothing else touches this collection. Password is
 * never stored in plain text; see services/auth.service.ts for the
 * bcryptjs hashing and where this model actually gets read/written.
 */
export interface IUser extends MongooseDocument {
  email: string;
  passwordHash: string;
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
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
