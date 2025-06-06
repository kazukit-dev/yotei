import { ResultAsync } from "neverthrow";

import { DB } from "../../../db";
import { DBError } from "../../../shared/errors";
import { UpdatedEvent } from "../workflows/update-event";
import { _createEvent } from "./shared/_create-event";
import { _updateEvent } from "./shared/_update-event";

export const updateEvent =
  (db: DB) =>
  (updates: UpdatedEvent): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      db.transaction<void>(async (tx) => {
        await _updateEvent(tx)(updates.update);
        if (updates.create) {
          await _createEvent(tx)(updates.create);
        }
      }),
      (e) => new DBError("Failed to update event.", { cause: e }),
    );
  };
