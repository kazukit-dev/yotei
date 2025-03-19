import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { calendarRouter } from "./calendar";
import { errorHandler } from "./error-handler";
import { eventRouter } from "./event";

const app = new Hono();

app.use(cors({ origin: "*" }));
app.use(logger());

app.get("/health-check", (c) => {
  return c.json({ message: "health check" }, 200);
});

app.route("/calendars", calendarRouter);
app.route("/calendars/:calendarId/events", eventRouter);

app.onError(errorHandler);

export default app;
