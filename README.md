# Event Booking System — Backend

A REST API for an event booking platform with two roles — **Event Organizers** (create/manage events) and **Customers** (browse events, book tickets) — plus background jobs for booking confirmations and event-update notifications.

## Tech stack

- Node.js + Express 5, TypeScript
- MongoDB + Mongoose
- Zod for request validation
- JWT in an httpOnly cookie for sessions, bcrypt for password hashing
- An in-process job queue for background tasks (see [Background jobs](#background-jobs))

Built on top of an internal `express-auth-starter` (signup/login/logout/session cookie, centralized error handling, `asyncHandler`), extended with roles, events, bookings, and background jobs. See the commit history for how each piece was added on top of that base.

## Getting started

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI / JWT_SECRET
npm run dev            # ts-node-dev, auto-restart, http://localhost:4000
```

`npm test` runs the vitest suite. `npm run build && npm start` runs the compiled output.

### Running with Docker

```bash
cp .env.example .env   # fill in JWT_SECRET; MONGODB_URI can be left as-is
docker compose up --build
```

Fully self-contained — `docker-compose.yml` includes a `mongo` service, and the `api` service's `MONGODB_URI` is set to point at it (`mongodb://mongo:27017/event-booking`), overriding whatever's in `.env`. No Atlas account or external database needed to run this locally; `.env` only needs to supply `JWT_SECRET` (and `CLIENT_ORIGIN`/`NODE_ENV` if you want non-default values). Mongo's data persists in a named volume (`mongo-data`) across restarts, and its host port is mapped to `27018` rather than the default `27017` in case something else on your machine (a local `mongod`) is already using it — the app itself always talks to Mongo over the internal Docker network regardless of that mapping.

The image itself is a multi-stage build: `npm ci && npm run build` runs in a builder stage, and only the compiled `dist/` + production dependencies make it into the runtime stage. `.dockerignore` keeps `node_modules`, `.env`, and `dist` out of the build context.

To point the containerized app at a real MongoDB (Atlas, etc.) instead of the bundled one, remove the `environment:` override on the `api` service in `docker-compose.yml` and put your real `MONGODB_URI` in `.env`.

## Data model

```
User      { email, passwordHash, role: "organizer" | "customer" }
Event     { title, description, venue, startTime, totalTickets,
            availableTickets, price, organizer: User._id }
Booking   { event: Event._id, customer: User._id, quantity }
```

`availableTickets` is a denormalized counter on `Event`, decremented at booking time, rather than derived by summing `Booking` documents on every read — a public event listing stays a single cheap document fetch instead of an aggregation.

## API

All endpoints except `/auth/*` require the session cookie (`requireAuth`). Role-gated endpoints are marked; per-resource ownership (an organizer only managing *their own* events) is enforced in the service layer, not just the route.

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | `{ email, password, role }` — create account |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/logout` | any | clears session cookie |
| GET | `/auth/me` | any | current user |
| POST | `/auth/guest` | — | throwaway demo account, `{ role? }` defaults to customer |
| POST | `/events` | organizer | create an event |
| GET | `/events` | any | list all events |
| GET | `/events/:id` | any | event detail |
| PUT | `/events/:id` | organizer, owner | update an event → enqueues update-notification job |
| DELETE | `/events/:id` | organizer, owner | delete an event |
| POST | `/events/:id/bookings` | customer | book tickets → enqueues confirmation job |
| GET | `/events/:id/bookings` | organizer, owner | list bookings for one of your events |
| GET | `/bookings/me` | customer | your own bookings |

## Design decisions

**Role-based access control.** `role` is fixed at signup and embedded directly in the JWT payload (`{ sub, role }`), so `requireRole(...)` middleware checks it in-memory instead of hitting the DB on every request. Trade-off: a role change would require re-login to take effect — acceptable here since roles never change post-signup in this domain. Route-level `requireRole` handles "can this role hit this endpoint at all"; **ownership** ("does this organizer own this specific event") is a separate, finer-grained check inside `event.service.ts` / `booking.service.ts`, so it can't be bypassed by wiring up a new route that forgets it.

**Preventing overselling under concurrent bookings.** A naive "read `availableTickets`, check in JS, then save" has a check-then-act race: two simultaneous requests can both read 1 ticket free and both write a booking. Instead, `booking.service.ts#createBooking` uses one atomic `findOneAndUpdate({ _id, availableTickets: { $gte: quantity } }, { $inc: { availableTickets: -quantity } })`. MongoDB only applies the decrement if the filter still holds at the instant it executes; a losing concurrent request gets `null` back and is told how many tickets are actually left, instead of the counter going negative. Verified manually: booking past capacity returns a `409` with the real remaining count, never a negative `availableTickets`.

**Background jobs.** The assignment asks for "any job queue or async processing mechanism." I built a small in-process queue (`src/jobs/queue.ts`): `enqueue()` pushes a `{ type, payload }` and returns immediately (the HTTP response never waits on a job), and a worker loop drains the queue via `setImmediate`. This intentionally mirrors the interface of a real broker (`enqueue(type, payload)`, registered handlers per type) without requiring Redis or another moving part for a two-hour, single-instance take-home. Trade-off: queued jobs are memory-only and are lost on process restart — acceptable since both jobs here are best-effort console notifications, not anything needing delivery guarantees. Swapping in BullMQ/Redis or Agenda/Mongo later only means replacing `queue.ts`; callers never see the transport.

- **Booking confirmation** — enqueued from `createBooking` right after the booking is persisted; handler logs a "confirmation email" line.
- **Event update notification** — enqueued from `updateEvent` right after the update is saved; handler queries `Booking.distinct("customer", { event })`, resolves those users, and logs a notification line per customer. The DB read for "who booked this event" happens inside the job, off the request path, so `PUT /events/:id` stays a fast single-document write for the caller.

**Layered architecture.** `routes/` (wiring only) → `controllers/` (parse/validate, call a service, shape the response) → `services/` (business logic, ownership checks, job enqueueing) → `models/` (schema only). One error hierarchy (`errors.ts`, `AppError` subclasses) is thrown from services and caught in exactly one place (`middleware/errorHandler.ts`), so no controller ever calls `res.status()` for a domain failure. This is the same structure the `express-auth-starter` this project is built on already established for auth; events/bookings just extend it.

**Nested vs. top-level booking routes.** `POST /events/:id/bookings` and `GET /events/:id/bookings` (organizer's view of one event's attendees) live nested under `/events` since they're scoped to an event. `GET /bookings/me` (a customer's cross-event booking history) is a separate top-level router, since it isn't scoped to any single event.

**Event capacity is fixed after creation.** `totalTickets` isn't editable via `PUT /events/:id` — resizing capacity once bookings already exist against it would need its own reconciliation logic (what happens if you shrink capacity below what's already booked?), which is out of scope here. `availableTickets` still changes, but only via the atomic booking path.

## What I'd add with more time

- Pagination/filtering on `GET /events` (by date, venue).
- Rate limiting on booking creation.
- A real broker (BullMQ) with retry/backoff if delivery guarantees mattered.
- More automated integration test coverage for the RBAC and concurrency paths (verified manually against a real MongoDB instance during development, via a disposable smoke-test script — not checked in).
