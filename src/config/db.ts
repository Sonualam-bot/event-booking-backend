import mongoose from "mongoose";

/**
 * Called from index.ts before app.listen() — a broken DB connection should
 * stop the server from starting, not serve requests that'll just 500.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
