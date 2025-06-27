import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ok } from "neverthrow";

import { AuthenticatedEnv } from "../../../env";
import { getCalendars } from "../query-services/get-calendars";
import { saveCreatedCalendar } from "../repositories/save-created-calendar";
import {
  createCalendarWorkflow,
  toUnvalidatedCalendar,
} from "../workflows/create-calendar";
import { createCalendarSchema } from "./schema";

const app = new Hono<AuthenticatedEnv>();

app.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId");
  const calendars = await getCalendars(db)(userId);
  return c.json(calendars);
});

app.post("/", zValidator("json", createCalendarSchema), async (c) => {
  const db = c.get("db");
  const input = c.req.valid("json");
  const userId = c.get("userId");

  const workflow = createCalendarWorkflow();
  const unvalidated = toUnvalidatedCalendar({ ...input, ownerId: userId });

  const process = ok(unvalidated)
    .andThen(workflow)
    .asyncAndThen(saveCreatedCalendar(db));

  return await process.match(
    (data) => c.json(data, 201),
    (error) => {
      throw error;
    },
  );
});

export default app;
