import { ResultAsync } from "neverthrow";

import {
  type createDBClient,
  type EventInsertModel,
  events,
  recurrenceRule,
  type RecurrenceRuleInsertModel,
  type Transaction,
} from "../../../db";
import { DBError } from "../../../shared/errors";
import type { Event } from "../objects/write/event";

type CreatedEvent = Event & { kind: "created" };

export const create =
  (db: ReturnType<typeof createDBClient> | Transaction) =>
  async ({ kind: _, ...model }: CreatedEvent): Promise<Event> => {
    const start = model.start.toISOString();
    const end = model.end.toISOString();

    const rrule: RecurrenceRuleInsertModel | null =
      "rrule" in model
        ? {
            ...model.rrule,
            event_id: model.id,
            until: model.rrule.until.toISOString(),
            dtstart: model.rrule.dtstart.toISOString(),
          }
        : null;

    const event: EventInsertModel = {
      ...model,
      start,
      end,
    };

    return db.transaction(async (tx) => {
      await tx.insert(events).values(event);
      if (rrule) {
        await tx.insert(recurrenceRule).values(rrule);
      }
      return model;
    });
  };

export const saveCreatedEvent =
  (db: ReturnType<typeof createDBClient> | Transaction) =>
  (createdEvent: CreatedEvent): ResultAsync<Event, DBError> => {
    return ResultAsync.fromPromise(
      create(db)(createdEvent),
      (e) => new DBError("Failed to save event.", { cause: e }),
    );
  };
