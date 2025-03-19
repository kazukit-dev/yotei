import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { BlankSchema } from "hono/types";
import { ok } from "neverthrow";
import { z } from "zod";
import { ValidationError } from "../../common/errors";
import { createDBClient } from "../../db";
import { saveCreatedCalendar } from "../repositories/save-created-calendar";
import {
  createCalendarWorkflow,
  toUnvalidatedCalendar,
} from "../workflow/create-calendar";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }, BlankSchema, "/calendars">();

const createCalendarSchema = z.object({
  name: z.string(),
});

app.get("/", async (c) => {
  const client = createDBClient(c.env.DATABASE_URL);
  const calendars = await client.query.calendars.findMany();
  return c.json(calendars);
});

app.post("/", zValidator("json", createCalendarSchema), async (c) => {
  const client = createDBClient(c.env.DATABASE_URL);
  const input = c.req.valid("json");

  const workflow = createCalendarWorkflow();
  const unvalidated = toUnvalidatedCalendar(input);

  const process = ok(unvalidated)
    .andThen(workflow)
    .asyncAndThen(saveCreatedCalendar(client));

  return await process.match(
    (data) => c.json({ message: "created", data }, 201),
    (e) => {
      if (e instanceof ValidationError) {
        return c.json({ message: e.message }, 400);
      }
      return c.json({ message: e.message }, 500);
    },
  );
});

export default app;
