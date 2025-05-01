import dayjs from "dayjs";
import { Result, ResultAsync } from "neverthrow";

import type {
  DB,
  EventExceptionSelectModel,
  EventSelectModel,
  RecurrenceRuleSelectModel,
} from "../../../db";
import { DBError } from "../../../shared/errors";
import { Event } from "../objects/event/read";
import type { CalendarId } from "../objects/id";
import type { GetEvents } from "../workflows/get-events";

const event = {
  id: true,
  title: true,
  start: true,
  end: true,
  calendar_id: true,
  duration: true,
  is_recurring: true,
  is_all_day: true,
  rrule: true,
  version: true,
} as const;

type EventExceptions = Pick<
  EventExceptionSelectModel,
  "type" | "target_date"
>[];

type RecurrenceRule = Pick<
  RecurrenceRuleSelectModel,
  "dtstart" | "until" | "freq"
>;

type EventModel = Omit<
  EventSelectModel,
  "created_at" | "updated_at" | "created_by"
> & { exceptions: EventExceptions } & {
  rrule?: RecurrenceRule | null;
};

const queryEvents =
  (client: DB) =>
  (
    calendarId: CalendarId,
    from: Date,
    to: Date,
  ): ResultAsync<EventModel[], DBError> => {
    const f = from.toISOString();
    const t = to.toISOString();

    return ResultAsync.fromPromise(
      client.query.events
        .findMany({
          where: (events, { and, or, eq, between, lte, gte }) =>
            and(
              eq(events.calendar_id, calendarId),
              or(
                between(events.start, f, t),
                between(events.end, f, t),
                and(lte(events.start, f), gte(events.end, t)),
                and(gte(events.start, f), lte(events.end, t)),
              ),
            ),
          columns: event,
          with: {
            exceptions: {
              where: (eventExceptions, { or, between }) => {
                return or(between(eventExceptions.target_date, f, t));
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
        })
        .execute(),
      (e) => new DBError("Failed to query events.", { cause: e }),
    );
  };

export const getEvents =
  (client: DB): GetEvents =>
  ({ input }) => {
    const from = dayjs(input.from).startOf("D").toDate();
    const to = dayjs(input.to).endOf("D").toDate();
    return queryEvents(client)(input.calendarId, from, to)
      .andThen((events) => {
        return Result.combine(events.map(Event.create));
      })
      .map((events) => {
        return {
          kind: "queried",
          events,
        } as const;
      })
      .mapErr((e) => new DBError("Failed to query events.", { cause: e }));
  };
