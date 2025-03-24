import { err, ok,ResultAsync } from "neverthrow";

import { DBError, EntityNotFound } from "../../common/errors";
import type { DB } from "../../db";
import type { EventDetail } from "../workflows/get-event-detail";

const findEventDetail =
  (db: DB) =>
  (
    calendarId: string,
    eventId: string,
  ): ResultAsync<EventDetail | undefined, DBError> => {
    return ResultAsync.fromPromise(
      db.query.events.findFirst({
        where: (events, { eq, and }) => {
          return and(
            eq(events.calendar_id, calendarId),
            eq(events.id, eventId),
          );
        },
        columns: {
          id: true,
          title: true,
          start: true,
          end: true,
          is_all_day: true,
          is_recurring: true,
          duration: true,
        },
        with: {
          exceptions: {
            columns: {
              type: true,
              target_date: true,
            },
          },
          rrule: {
            columns: {
              freq: true,
              until: true,
              dtstart: true,
            },
          },
        },
      }),
      (err) => new DBError("get event detail error", { cause: err }),
    );
  };

export const getEventDetail =
  (db: DB) =>
  (
    calendarId: string,
    eventId: string,
  ): ResultAsync<EventDetail, DBError | EntityNotFound> => {
    return findEventDetail(db)(calendarId, eventId).andThen((event) => {
      return event
        ? ok(event)
        : err(new EntityNotFound(`Not found event ${eventId}`));
    });
  };
