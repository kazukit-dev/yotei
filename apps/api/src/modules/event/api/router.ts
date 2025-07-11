import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { ok, Result } from "neverthrow";

import { Env } from "../../../env";
import { ValidationError } from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import { createCalendarId, createEventId } from "../objects/write/id";
import { getEventDetail } from "../query-services/get-event-detail";
import { getEvents } from "../query-services/get-events";
import { deleteEvent } from "../repositories/delete-event";
import { getEventById } from "../repositories/get-event";
import { saveCreatedEvent } from "../repositories/save-created-event";
import { updateEvent } from "../repositories/update-event";
import {
  createEventWorkflow,
  toUnvalidatedEvent,
} from "../workflows/create-event";
import {
  deleteEventWorkflow,
  toUnvalidatedDeleteCommand,
} from "../workflows/delete-event";
import { getEventDetailWorkflow } from "../workflows/get-event-detail";
import {
  queryEventsWorkflow,
  toUnvalidatedQueryCommand,
} from "../workflows/query-events";
import {
  toUnvalidateUpdateCommand,
  updateEventWorkflow,
} from "../workflows/update-event";
import {
  createEventSchema,
  deleteEventSchema,
  getEventDetailSchema,
  getEventsSchema,
  updateEventSchema,
} from "./schema";

const app = new Hono<Env, BlankSchema, "/calendars/:calendarId/events">();

app.post("/", zValidator("json", createEventSchema), async (c) => {
  const db = c.get("db");
  const { calendarId } = c.req.param();
  const schema = c.req.valid("json");

  const workflow = createEventWorkflow();
  const unvalidatedEvent = toUnvalidatedEvent({
    ...schema,
    calendar_id: calendarId,
  });
  const result = ok(unvalidatedEvent)
    .andThen(workflow)
    .asyncAndThen(saveCreatedEvent(db));

  return await result.match(
    () => {
      return c.json(201);
    },
    (err) => {
      throw err;
    },
  );
});

app.get("/", zValidator("query", getEventsSchema), async (c) => {
  const db = c.get("db");

  const { calendarId } = c.req.param();
  const query = c.req.valid("query");

  const unvalidatedCommand = toUnvalidatedQueryCommand({
    calendarId,
    ...query,
  });
  const workflow = queryEventsWorkflow(getEvents(db));
  const result = ok(unvalidatedCommand).asyncAndThen(workflow);

  return await result.match(
    (data) => {
      return c.json(data, 200);
    },
    (err) => {
      throw err;
    },
  );
});

app.put("/:eventId", zValidator("json", updateEventSchema), async (c) => {
  const db = c.get("db");
  const params = c.req.param();
  const input = c.req.valid("json");

  const workflow = updateEventWorkflow();

  const calendarId = createCalendarId(params.calendarId);
  const eventId = createEventId(params.eventId);
  const values = Result.combineWithAllErrors(tuple(calendarId, eventId)).mapErr(
    (errors) => new ValidationError(errors),
  );

  const process = values
    .asyncAndThen(([calendarId, eventId]) =>
      getEventById(db)(calendarId, eventId),
    )
    .map((event) => toUnvalidateUpdateCommand(input, event));

  return await process
    .andThen(workflow)
    .andThen(updateEvent(db))
    .match(
      () => {
        return c.json(null, 201);
      },
      (err) => {
        throw err;
      },
    );
});

app.get("/:eventId", zValidator("query", getEventDetailSchema), async (c) => {
  const db = c.get("db");
  const { calendarId, eventId } = c.req.param();
  const query = c.req.valid("query");

  const workflow = getEventDetailWorkflow();

  const preprocess = getEventDetail(db)(calendarId, eventId).map(
    (event) =>
      ({
        kind: "unfound",
        event,
        input: query,
      }) as const,
  );

  return await preprocess.andThen(workflow).match(
    ({ kind: _, ...event }) => {
      return c.json(event, 200);
    },
    (err) => {
      throw err;
    },
  );
});

app.delete("/:eventId", zValidator("json", deleteEventSchema), async (c) => {
  const db = c.get("db");
  const params = c.req.param();
  const { pattern, target_date } = c.req.valid("json");

  const calendarId = createCalendarId(params.calendarId);
  const eventId = createEventId(params.eventId);
  const values = Result.combineWithAllErrors(tuple(calendarId, eventId)).mapErr(
    (errors) => new ValidationError(errors),
  );

  const process = values
    .asyncAndThen(([calendarId, eventId]) =>
      getEventById(db)(calendarId, eventId),
    )
    .map((event) =>
      toUnvalidatedDeleteCommand({ event, target_date, pattern }),
    );

  return await process
    .andThen(deleteEventWorkflow)
    .andThrough(({ event }) => deleteEvent(db)(event))
    .match(
      ({ affected_range }) => {
        return c.json({ affected_range }, 200);
      },
      (err) => {
        throw err;
      },
    );
});

export default app;
