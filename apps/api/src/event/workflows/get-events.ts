import { err, ok,Result, type ResultAsync } from "neverthrow";

import { ValidationError } from "../../common/errors";
import dayjs from "../../helpers/dayjs";
import {
  type Event,
  getOccurrences,
  type Occurrence,
} from "../objects/event/read";
import { CalendarId } from "../objects/id";

export class QueryEventsError extends Error {}
export class ExpandError extends Error {}

interface EventDto {
  id: string;
  title: string;
  start: Date;
  end: Date;
  is_all_day: boolean;
  is_recurring: boolean;
  rrule?: {
    dtstart: Date;
    until: Date;
    freq: number;
  };
}

type UnvalidatedInput = {
  calendarId: string;
  from: string;
  to: string;
};

type UnvalidatedCommand = {
  input: UnvalidatedInput;
  kind: "unvalidated";
};

type ValidatedInput = {
  calendarId: CalendarId;
  from: Date;
  to: Date;
};

export type ValidatedCommand = {
  input: ValidatedInput;
  kind: "validated";
};

type QueriedEvents = {
  events: Event[];
  kind: "queried";
};

type ExpandedCommand = {
  events: EventDto[];
  kind: "expanded";
};

type Validate = (
  command: UnvalidatedCommand,
) => Result<ValidatedCommand, ValidationError>;

export type GetEvents = (
  command: ValidatedCommand,
) => ResultAsync<QueriedEvents, QueryEventsError>;

type ExpandEvents = (
  command: QueriedEvents,
) => Result<ExpandedCommand, ExpandError>;

type Workflow = (
  command: UnvalidatedCommand,
) => ResultAsync<
  Occurrence[],
  ValidationError | QueryEventsError | ExpandError
>;

export const toUnvalidatedQueryCommand = (input: {
  calendarId: string;
  from: string;
  to: string;
}): UnvalidatedCommand => {
  return {
    input,
    kind: "unvalidated",
  };
};

const validate: Validate = ({ input }) => {
  const calendarId = CalendarId.create(input.calendarId);
  const dateRange = dayjs(input.to).isAfter(input.from)
    ? ok({ from: new Date(input.from), to: new Date(input.to) })
    : err("InvalidDateRange");

  return Result.combineWithAllErrors([dateRange, calendarId])
    .map(([dateRange, calendarId]) => {
      return {
        input: {
          ...dateRange,
          calendarId,
        },
        kind: "validated",
      } as const;
    })
    .mapErr((e) => new ValidationError(e));
};

const expandEvents =
  (from: Date, to: Date): ExpandEvents =>
  ({ events }) => {
    const expanded = events.flatMap((event) => {
      const occurrences = getOccurrences(from, to)(event);
      const events = occurrences.map(
        ({ title, is_all_day, start, end }) =>
          ({
            ...event,
            title,
            start,
            end,
            is_all_day,
          }) satisfies EventDto,
      );
      return events;
    });
    return ok({ kind: "expanded", events: expanded });
  };

export const createQueryWorkflow =
  (getEvents: GetEvents): Workflow =>
  (unvalidatedCommand) => {
    const validateResult = ok(unvalidatedCommand).andThen(validate);

    return validateResult.asyncAndThen((validatedCommand) => {
      const { input } = validatedCommand;
      return ok(validatedCommand)
        .asyncAndThen(getEvents)
        .andThen(expandEvents(input.from, input.to))
        .map((result) => result.events);
    });
  };
