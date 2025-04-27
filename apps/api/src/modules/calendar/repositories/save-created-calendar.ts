import { ResultAsync } from "neverthrow";

import { type createDBClient } from "../../../db";
import { calendars } from "../../../db/schema/calendar";
import { DBError } from "../../../shared/errors";
import { CalendarId } from "../objects/write/id";
import { CalendarName } from "../objects/write/name";
import { OwnerId } from "../objects/write/owner-id";

type CreatedCalendar = {
  kind: "created";
  id: CalendarId;
  name: CalendarName;
  ownerId: OwnerId;
};

export const saveCreatedCalendar =
  (db: ReturnType<typeof createDBClient>) =>
  ({ kind: _, ...model }: CreatedCalendar) => {
    return ResultAsync.fromPromise(
      db
        .insert(calendars)
        .values({ id: model.id, name: model.name, owner_id: model.ownerId })
        .returning(),
      (e) => new DBError("Failed to save calendar.", { cause: e }),
    );
  };
