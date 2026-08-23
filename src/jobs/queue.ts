/**
 * Minimal in-process job queue: enqueue() returns immediately so a
 * request handler never waits on a job's side effects, and a worker
 * loop drains the queue on the event loop via setImmediate — the same
 * decoupling a real queue (BullMQ/Redis, Agenda/Mongo) gives you, without
 * standing up extra infra for a take-home assignment. Swapping in a real
 * broker later only means replacing this file: callers just do
 * `queue.enqueue(type, payload)` and never see the transport.
 *
 * Trade-off: jobs live in memory, so a process restart drops anything
 * still queued. Acceptable here since jobs are best-effort console
 * notifications, not anything requiring delivery guarantees.
 */
type JobHandler<T = any> = (payload: T) => Promise<void> | void;

class JobQueue {
  private handlers = new Map<string, JobHandler>();
  private tasks: Array<{ type: string; payload: unknown }> = [];
  private draining = false;

  register<T>(type: string, handler: JobHandler<T>) {
    this.handlers.set(type, handler);
  }

  enqueue<T>(type: string, payload: T) {
    this.tasks.push({ type, payload });
    this.drain();
  }

  private drain() {
    if (this.draining) return;
    this.draining = true;
    setImmediate(async () => {
      while (this.tasks.length > 0) {
        const task = this.tasks.shift()!;
        const handler = this.handlers.get(task.type);
        if (!handler) {
          console.error(`[jobs] no handler registered for "${task.type}"`);
          continue;
        }
        try {
          await handler(task.payload);
        } catch (err) {
          console.error(`[jobs] handler for "${task.type}" failed:`, err);
        }
      }
      this.draining = false;
    });
  }
}

export const jobQueue = new JobQueue();

export const JobType = {
  BOOKING_CONFIRMATION: "booking-confirmation",
  EVENT_UPDATE_NOTIFICATION: "event-update-notification",
} as const;
