import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { errorHandler } from "./error-handler";
import { authRouter } from "./modules/auth";
import { authenticate } from "./modules/auth/middlewares/authenticate";
import { eventRouter } from "./modules/event";
import { userRouter } from "./modules/user";
import { createAuthenticatedApp } from "./shared/hono";

const app = new Hono();

app.use(cors({ origin: "*" }));
app.use(logger());

app.get("/health-check", (c) => {
  return c.json({ message: "health check" }, 200);
});
app.route("/auth", authRouter);

const authenticatedApp = createAuthenticatedApp<"/">();
authenticatedApp.use(authenticate);
authenticatedApp.route("/users", userRouter);
authenticatedApp.route("/calendars/:calendarId/events", eventRouter);
app.route("/", authenticatedApp);

app.onError(errorHandler);

export default app;
