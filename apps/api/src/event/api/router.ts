import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { BlankSchema } from "hono/types";
import { ok, Result } from "neverthrow";

import { ValidationError } from "../../common/errors";
import { createDBClient } from "../../db";
import { tuple } from "../../helpers/tuple";
import { CalendarId, EventId } from "../objects/id";
import { getEventDetail } from "../query-service/get-event-detail";
import { deleteEvent } from "../repositories/delete-event";
import { getEventById } from "../repositories/get-event";
import { getEvents } from "../repositories/query-events";
import { create, saveCreatedEvent } from "../repositories/save-created-event";
import { transaction } from "../repositories/transaction";
import { updateEvent, upsert } from "../repositories/update-event";
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
  createQueryWorkflow,
  toUnvalidatedQueryCommand,
} from "../workflows/get-events";
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

type Bindings = {
  DB: D1Database;
  DATABASE_URL: string;
};

const app = new Hono<
  { Bindings: Bindings },
  BlankSchema,
  "/calendars/:calendarId/events"
>();

app.post("/", zValidator("json", createEventSchema), async (c) => {
  const client = createDBClient(c.env.DATABASE_URL);
  const { calendarId } = c.req.param();
  const schema = c.req.valid("json");

  const workflow = createEventWorkflow();
  const unvalidatedEvent = toUnvalidatedEvent({
    ...schema,
    calendar_id: calendarId,
  });
  const result = ok(unvalidatedEvent)
    .andThen(workflow)
    .asyncAndThen(saveCreatedEvent(client));

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
  const client = createDBClient(c.env.DATABASE_URL);
  const params = c.req.param();
  const query = c.req.valid("query");

  const unvalidatedCommand = toUnvalidatedQueryCommand({
    calendarId: params.calendarId,
    ...query,
  });
  const workflow = createQueryWorkflow(getEvents(client));
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
  const client = createDBClient(c.env.DATABASE_URL);
  const params = c.req.param();
  const input = c.req.valid("json");

  const workflow = updateEventWorkflow();

  const calendarId = CalendarId.create(params.calendarId);
  const eventId = EventId.create(params.eventId);
  const values = Result.combineWithAllErrors(tuple(calendarId, eventId)).mapErr(
    (errors) => new ValidationError(errors),
  );

  const process = values
    .asyncAndThen(([calendarId, eventId]) =>
      getEventById(client)(calendarId, eventId),
    )
    .map((event) => toUnvalidateUpdateCommand(input, event));

  return await process
    .andThen(workflow)
    .andThen((result) => {
      return transaction(client)(async (tx) => {
        await upsert(tx)(result.update);
        if (result.create) {
          await create(tx)(result.create);
        }
        return;
      });
    })
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
  const db = createDBClient(c.env.DATABASE_URL);
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
  const db = createDBClient(c.env.DATABASE_URL);
  const params = c.req.param();
  const { pattern, target_date } = c.req.valid("json");

  const calendarId = CalendarId.create(params.calendarId);
  const eventId = EventId.create(params.eventId);
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
    .andThen(({ event, affected_range }) => {
      switch (event.kind) {
        case "deleted":
          return deleteEvent(db)(event).andThen(() => ok({ affected_range }));
        case "updated":
          return updateEvent(db)(event).andThen(() => ok({ affected_range }));
      }
    })
    .match(
      (result) => {
        return c.json(result, 200);
      },
      (err) => {
        throw err;
      },
    );
});

export default app;
