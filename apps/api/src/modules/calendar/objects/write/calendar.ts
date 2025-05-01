import { Result } from "neverthrow";

import { ValidationError } from "../../../../shared/errors";
import { tuple } from "../../../../shared/helpers/tuple";
import { CalendarId } from "../../../event/objects/write/id";
import { createCalendarId } from "./id";
import { CalendarName, createCalendarName } from "./name";
import { createOwnerId, OwnerId } from "./owner-id";

export type Calendar = {
  id: CalendarId;
  name: CalendarName;
  owner_id: OwnerId;
};

export const createCalendar = (data: {
  id: string;
  name: string;
  owner_id: string;
}): Result<Calendar, ValidationError> => {
  const calendarId = createCalendarId(data.id);
  const calendarName = createCalendarName(data.name);
  const ownerId = createOwnerId(data.owner_id);

  const values = tuple(calendarId, calendarName, ownerId);

  return Result.combineWithAllErrors(values)
    .map(([id, name, ownerId]) => {
      return {
        id,
        name,
        owner_id: ownerId,
      } as const;
    })
    .mapErr((errs) => new ValidationError(errs));
};
