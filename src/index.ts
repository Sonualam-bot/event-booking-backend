import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";

/**
 * Entry point — wires middleware, mounts routes/*.routes.ts, and starts
 * the server only after config/db.ts confirms a DB connection. Request
 * flow for any endpoint: routes/ -> controllers/ -> services/ -> models/,
 * with errors bubbling up through middleware/errorHandler.ts, mounted
 * last below. Add a new domain's routes the same way authRoutes is
 * mounted: `app.use("/things", thingRoutes)`, placed above errorHandler.
 */

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

/** Bare root — mainly so visiting the deployed URL directly shows something readable instead of Express's default "Cannot GET /". */
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "api" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

/**
 * Must be mounted after every route it's meant to catch — Express only
 * routes a next(err) call to error middleware registered below the route
 * that raised it. Any new route needs to go above this line, not below.
 */
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
