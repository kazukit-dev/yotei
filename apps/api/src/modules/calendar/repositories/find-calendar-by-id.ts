import { eq } from "drizzle-orm";
import { err, ResultAsync } from "neverthrow";

import { calendars, DB } from "../../../db";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { Calendar, createCalendar } from "../objects/write/calendar";
import { CalendarId } from "../objects/write/id";

type RawCalendar = {
  id: string;
  name: string;
  owner_id: string;
};

const findCalendarById =
  (db: DB) =>
  async (calendarId: CalendarId): Promise<RawCalendar | null> => {
    const data = await db
      .select({
        id: calendars.id,
        name: calendars.name,
        owner_id: calendars.owner_id,
      })
      .from(calendars)
      .where(eq(calendars.id, calendarId));

    if (!data.length) return null;
    return data[0];
  };

export const getCalendarById =
  (db: DB) =>
  (
    calendarId: CalendarId,
  ): ResultAsync<Calendar, ValidationError | EntityNotFound | DBError> => {
    return ResultAsync.fromPromise(
      findCalendarById(db)(calendarId),
      (err) =>
        new DBError(`Failed to find calendar by id ${calendarId}`, {
          cause: err,
        }),
    ).andThen((calendar) => {
      return calendar
        ? createCalendar(calendar)
        : err(new EntityNotFound(`Calendar with id ${calendarId} not found`));
    });
  };
