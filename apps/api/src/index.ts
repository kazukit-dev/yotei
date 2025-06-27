import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { logger } from "hono/logger";

import { createDBClient } from "./db";
import { CORS_ORIGIN, DATABASE_URL, Env } from "./env";
import { errorHandler } from "./error-handler";
import { auth, authenticate } from "./modules/auth";
import { calendar, checkCalendarPermission } from "./modules/calendar";
import { event } from "./modules/event";
import { user } from "./modules/user";

const app = new Hono<Env>();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(logger());

app.use(
  createMiddleware(async (c, next) => {
    const db = createDBClient(DATABASE_URL);
    c.set("db", db);
    await next();
  }),
);

// public routes
app.get("/health-check", (c) => {
  return c.json({ message: "ok" }, 200);
});
app.route("/auth", auth);

// protected routes
app.use("/users/*", authenticate);
app.route("/users", user);

app.use("/calendars/*", authenticate);
app.route("/calendars", calendar);
app.use("/calendars/:calendarId/*", checkCalendarPermission);
app.route("/calendars/:calendarId/events", event);

app.onError(errorHandler);

export default app;
