import { ResultAsync } from "neverthrow";

import { createDBClient } from "../../../db";
import { DBError } from "../../../shared/errors";
import { Event } from "../objects/write/event";
import { EventId } from "../objects/write/id";
import { _deleteEvent } from "./shared/_delete-event";
import { _updateEvent } from "./shared/_update-event";

type DeletedEvent =
  | { id: EventId; kind: "deleted" }
  | (Event & { kind: "updated" });

export const deleteEvent = (db: ReturnType<typeof createDBClient>) => {
  return (model: DeletedEvent): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      db.transaction<void>(async (tx) => {
        switch (model.kind) {
          case "deleted":
            await _deleteEvent(tx)(model.id);
            break;
          case "updated":
            await _updateEvent(tx)(model);
            break;
          default:
            throw new Error("Invalid model kind");
        }
      }),
      (e) => new DBError("Failed to delete event.", { cause: e }),
    );
  };
};
