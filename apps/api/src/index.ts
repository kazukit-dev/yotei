import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { errorHandler } from "./error-handler";
import { authRouter } from "./modules/auth";
import { authenticate } from "./modules/auth/middlewares/authenticate";
import { calendarRouter } from "./modules/calendar";
import { eventRouter } from "./modules/event";

const app = new Hono();

app.use(cors({ origin: "*" }));
app.use(logger());

app.get("/health-check", (c) => {
  return c.json({ message: "health check" }, 200);
});

app.route("/auth", authRouter);

app.use("/calendars/*", authenticate);
app.route("/calendars", calendarRouter);
app.route("/calendars/:calendarId/events", eventRouter);

app.onError(errorHandler);

export default app;
