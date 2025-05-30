import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ok } from "neverthrow";

import { createDBClient } from "../../../db";
import { Env } from "../../../env";
import { getCalendars } from "../query-service/get-calendars";
import { saveCreatedCalendar } from "../repositories/save-created-calendar";
import {
  createCalendarWorkflow,
  toUnvalidatedCalendar,
} from "../workflow/create-calendar";
import { createCalendarSchema } from "./schema";

const app = new Hono<Env>();

app.get("/", async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const userId = c.get("userId");
  const calendars = await getCalendars(db)(userId);
  return c.json(calendars);
});

app.post("/", zValidator("json", createCalendarSchema), async (c) => {
  const client = createDBClient(c.env.DATABASE_URL);
  const input = c.req.valid("json");
  const userId = c.get("userId");

  const workflow = createCalendarWorkflow();
  const unvalidated = toUnvalidatedCalendar({ ...input, ownerId: userId });

  const process = ok(unvalidated)
    .andThen(workflow)
    .asyncAndThen(saveCreatedCalendar(client));

  return await process.match(
    (data) => c.json(data, 201),
    (error) => {
      throw error;
    },
  );
});

export default app;
