import { ResultAsync } from "neverthrow";

import { calendars, type createDBClient } from "../../../db";
import { DBError } from "../../../shared/errors";
import type { CreatedCalendar } from "../workflow/create-calendar";

export const saveCreatedCalendar =
  (db: ReturnType<typeof createDBClient>) =>
  ({ kind: _, ...model }: CreatedCalendar) => {
    return ResultAsync.fromPromise(
      db.insert(calendars).values(model).returning(),
      (e) => new DBError("Failed to save calendar.", { cause: e }),
    );
  };
