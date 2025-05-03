import { ResultAsync } from "neverthrow";

import { DB } from "../../../db";
import { DBError } from "../../../shared/errors";
import { Event, toEventModel } from "../objects/read/event";

type QueriedEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar_id: string;
  duration: number;
  is_recurring: boolean;
  is_all_day: boolean;
  version: number;
  rrule: {
    until: string;
    freq: number;
    dtstart: string;
  } | null;
  exceptions: {
    target_date: string;
    type: string;
  }[];
};

const queryEvents =
  (db: DB) =>
  async (
    calendarId: string,
    range: { from: Date; to: Date },
  ): Promise<QueriedEvent[]> => {
    const from = range.from.toISOString();
    const to = range.to.toISOString();
    const data = await db.query.events.findMany({
      where: (events, { and, or, eq, between, lte, gte }) =>
        and(
          eq(events.calendar_id, calendarId),
          or(
            between(events.start, from, to),
            between(events.end, from, to),
            and(lte(events.start, from), gte(events.end, to)),
            and(gte(events.start, from), lte(events.end, to)),
          ),
        ),
      columns: {
        id: true,
        title: true,
        start: true,
        end: true,
        calendar_id: true,
        duration: true,
        is_recurring: true,
        is_all_day: true,
        version: true,
      },
      with: {
        exceptions: {
          where: (eventExceptions, { between }) => {
            return between(eventExceptions.target_date, from, to);
          },
          columns: {
            target_date: true,
            type: true,
          },
        },
        rrule: {
          columns: {
            until: true,
            dtstart: true,
            freq: true,
          },
        },
      },
    });
    return data;
  };

export const getEvents =
  (db: DB) =>
  (
    calendarId: string,
    range: { from: Date; to: Date },
  ): ResultAsync<Event[], DBError> => {
    return ResultAsync.fromPromise(
      queryEvents(db)(calendarId, range),
      (err) => new DBError("Failed to query events", { cause: err }),
    ).map((events) => events.map(toEventModel));
  };
