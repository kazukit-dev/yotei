import { err, ok, ResultAsync } from "neverthrow";

import { DBError, EntityNotFound } from "../../../shared/errors";
import { Calendar } from "../objects/write/calendar";
import { CalendarId, createCalendarId } from "../objects/write/id";

class CalendarPermissionError extends Error {}

type WorkflowError = CalendarPermissionError | DBError | EntityNotFound;

type CalendarDto = {
  id: string;
  name: string;
};

type Unvalidated = {
  kind: "unvalidated";
  input: {
    calendarId: string;
  };
};

type ValidatedCalendar = {
  kind: "validated";
  calendar: CalendarDto;
};

type Validate = (
  input: Unvalidated,
) => ResultAsync<
  ValidatedCalendar,
  CalendarPermissionError | DBError | EntityNotFound
>;

type FindCalendarById = (
  calendarId: CalendarId,
) => ResultAsync<Calendar, DBError | EntityNotFound>;

type Workflow = (
  userId: string,
  findCalendarById: FindCalendarById,
) => (input: Unvalidated) => ResultAsync<ValidatedCalendar, WorkflowError>;

const validate =
  (userId: string, findCalendarById: FindCalendarById): Validate =>
  ({ input }) => {
    const { calendarId } = input;

    return createCalendarId(calendarId)
      .asyncAndThen(findCalendarById)
      .andThen((calendar) => {
        if (calendar.owner_id === userId) {
          return ok({
            kind: "validated",
            calendar: { id: calendar.id, name: calendar.name },
          } as const);
        }
        return err(
          new CalendarPermissionError(
            "User does not have permission to access this calendar.",
          ),
        );
      });
  };

export const toUnvalidatedCommand = (calendarId: string): Unvalidated => {
  return { kind: "unvalidated", input: { calendarId } } as const;
};

export const checkCalendarPermissionWorkflow: Workflow = (
  userId,
  findCalendarById,
) => {
  return (input) => {
    return ok(input).asyncAndThen(validate(userId, findCalendarById));
  };
};
