import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";

import { createDBClient, events } from "../../../db";
import { DBError } from "../../../shared/errors";
import { EventId } from "../objects/id";

type DeletedEvent = { id: EventId; kind: "deleted" };

export const deleteEvent = (db: ReturnType<typeof createDBClient>) => {
  return ({ id }: DeletedEvent): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      db
        .delete(events)
        .where(eq(events.id, id))
        .then(() => undefined),
      (err) => new DBError("Failed to delete event", { cause: err }),
    );
  };
};
