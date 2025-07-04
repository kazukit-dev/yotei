import { and } from "drizzle-orm";
import { err, ok, ResultAsync } from "neverthrow";

import type { createDBClient } from "../../../db";
import { DBError, EntityNotFound } from "../../../shared/errors";
import { createEvent, Event } from "../objects/write/event";
import type { CalendarId, EventId } from "../objects/write/id";

const findById =
  (client: ReturnType<typeof createDBClient>) =>
  (
    calendarId: CalendarId,
    eventId: EventId,
  ): ResultAsync<Event | null, DBError> => {
    return ResultAsync.fromPromise(
      client.query.events.findFirst({
        where: (events, { eq }) =>
          and(eq(events.id, eventId), eq(events.calendar_id, calendarId)),
        columns: {
          version: false,
          updated_at: false,
          created_at: false,
        },
        with: {
          exceptions: {
            columns: {
              created_at: false,
            },
          },
          rrule: {
            columns: {
              id: false,
              event_id: false,
            },
          },
        },
      }),
      (err) => new DBError("Failed to get event by event-id.", { cause: err }),
    ).andThen((event) => (event ? createEvent(event) : ok(null)));
  };

export const getEventById =
  (client: ReturnType<typeof createDBClient>) =>
  (
    calendarId: CalendarId,
    eventId: EventId,
  ): ResultAsync<Event, EntityNotFound | DBError> => {
    return findById(client)(calendarId, eventId).andThen((result) =>
      result
        ? ok(result)
        : err(new EntityNotFound(`Not found event ${eventId}`)),
    );
  };
