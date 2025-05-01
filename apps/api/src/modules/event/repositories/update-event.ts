import { and, eq, sql } from "drizzle-orm";
import { ResultAsync } from "neverthrow";

import {
  buildConflictUpdateColumns,
  type createDBClient,
  type EventExceptionInsertModel,
  eventExceptions,
  events,
  recurrenceRule,
  type Transaction,
} from "../../../db";
import { DBError } from "../../../shared/errors";
import type { Event } from "../objects/write/event";

type UpdatedEvent = Event & { kind: "updated" };

export const upsert =
  (db: ReturnType<typeof createDBClient> | Transaction) =>
  async ({ kind: _, ...event }: UpdatedEvent) => {
    return db.transaction(async (tx) => {
      if (!event.is_recurring) {
        tx.update(events)
          .set({
            ...event,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
          })
          .where(eq(events.id, event.id))
          .execute();
        return event;
      }

      const { rrule, exceptions, ...rest } = event;
      await tx
        .update(events)
        .set({
          ...rest,
          start: rest.start.toISOString(),
          end: rest.end.toISOString(),
          version: sql`${events.version} + 1`,
        })
        .where(eq(events.id, rest.id))
        .execute();

      await tx
        .update(recurrenceRule)
        .set({
          ...rrule,
          until: rrule.until.toISOString(),
          dtstart: rrule.dtstart.toISOString(),
        })
        .where(and(eq(recurrenceRule.event_id, rest.id)))
        .execute();

      // NOTE: exceptionsが空の場合エラーが出る
      if (!exceptions.length) return event;

      const exceptionModels: EventExceptionInsertModel[] = exceptions.map(
        (ex) => {
          return {
            ...ex,
            event_id: event.id,
            target_date: ex.target_date.toISOString(),
          };
        },
      );

      await tx
        .insert(eventExceptions)
        .values(exceptionModels)
        .onConflictDoUpdate({
          target: [eventExceptions.event_id, eventExceptions.target_date],
          set: buildConflictUpdateColumns(eventExceptions, ["type"]),
        })
        .execute();

      return event;
    });
  };

export const updateEvent =
  (db: ReturnType<typeof createDBClient> | Transaction) =>
  (updatedEvent: UpdatedEvent) => {
    return ResultAsync.fromPromise(
      upsert(db)(updatedEvent),
      (err) => new DBError("Failed to update event.", { cause: err }),
    );
  };
