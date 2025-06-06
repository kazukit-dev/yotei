import {
  DB,
  EventInsertModel,
  events,
  recurrenceRule,
  RecurrenceRuleInsertModel,
  Transaction,
} from "../../../../db";
import { Event } from "../../objects/write/event";

export const _createEvent =
  (db: DB | Transaction) =>
  async (model: Event): Promise<Event> => {
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
