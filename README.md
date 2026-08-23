# Express Auth Starter

Extracted from the MRPC take-home assignment. Everything here is auth/plumbing, not domain logic — copy this folder as the starting point for a new assignment instead of rebuilding signup/login/sessions/error-handling from scratch each time.

## What's included

- **Auth**: signup, login, logout, `GET /auth/me`, and a "guest" endpoint that creates a fresh throwaway account per call (handy for demoing an app without a seed script — delete `createGuestUser`/the `/auth/guest` route/`guest` controller if a project doesn't want it).
- **Password hashing**: bcryptjs.
- **Sessions**: JWT in an httpOnly cookie, `secure`/`sameSite` flags gated on `NODE_ENV === "production"` (relaxed in dev for same-site-different-port localhost, strict in prod for a real cross-origin deploy).
- **`requireAuth` middleware**: verifies the cookie, attaches `req.userId` — scope any new model's queries by this field for per-user data isolation.
- **Centralized error handling**: `AppError` base class + subclasses in `errors.ts`, all caught in one place (`middleware/errorHandler.ts`), which also recognizes `ZodError` (validation) and Mongoose's `CastError` (bad ObjectId in a URL param).
- **`asyncHandler`**: wraps every controller so a rejected promise reaches the error handler instead of hanging the request.
- **MongoDB connection**: fail-fast — `connectDB()` throws if `MONGODB_URI` is unset, called before `app.listen()`.

## Layered structure

```
routes/       wiring only — no logic
controllers/  thin: parse/validate request, call a service, shape the response
services/     business logic (this is where a new project's real work goes)
models/       Mongoose schema = data shape only
validation/   Zod request-body schemas
middleware/   requireAuth, errorHandler — cross-cutting concerns
errors.ts     one class per case that needs a specific HTTP status
```

## Using this for a new project

1. Copy this folder, rename it, `npm install`.
2. `cp .env.example .env` and fill in `MONGODB_URI`/`JWT_SECRET`/`CLIENT_ORIGIN`.
3. `npm run dev` — confirm `/health` responds before building anything on top.
4. Add your own domain: a model in `models/`, a Zod schema in `validation/`, a service in `services/` (scope every query by `req.userId` for per-user isolation), a thin controller in `controllers/`, and a router in `routes/` mounted in `index.ts` above `errorHandler` — same pattern `auth.routes.ts` already follows.
5. Add your own `AppError` subclasses in `errors.ts` as new failure cases come up; give any non-`AppError` thrown type (e.g. a validation error from a calculation module) its own `instanceof` branch in `errorHandler.ts`, the way the comment there points out.

## Commands

```bash
npm run dev     # ts-node-dev, auto-restart
npm run build   # tsc -> dist/
npm start        # node dist/index.js — what a host like Render should run
npm test         # vitest
```
