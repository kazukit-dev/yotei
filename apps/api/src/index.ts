import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { CORS_ORIGIN } from "./config";
import { errorHandler } from "./error-handler";
import { authenticate,authV2Router  } from "./modules/auth";
import { calendarRouter, checkCalendarPermission } from "./modules/calendar";
import { eventRouter } from "./modules/event";
import { userRouter } from "./modules/user";
import { createAuthenticatedApp } from "./shared/hono";

const app = new Hono();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(logger());

app.get("/health-check", (c) => {
  return c.json({ message: "health check" }, 200);
});

app.route("/auth", authV2Router);

const authenticatedApp = createAuthenticatedApp<"/">();
authenticatedApp.use(authenticate);
authenticatedApp.route("/users", userRouter);
authenticatedApp.route("/calendars", calendarRouter);
authenticatedApp.use("/calendars/:calendarId/*", checkCalendarPermission);
authenticatedApp.route("/calendars/:calendarId/events", eventRouter);
app.route("/", authenticatedApp);

app.onError(errorHandler);

export default app;
