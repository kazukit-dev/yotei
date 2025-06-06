import { eq } from "drizzle-orm";

import { DB, events, Transaction } from "../../../../db";
import { EventId } from "../../objects/write/id";

export const _deleteEvent =
  (db: DB | Transaction) =>
  async (id: EventId): Promise<void> => {
    await db.delete(events).where(eq(events.id, id));
  };
