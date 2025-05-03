import { err, ok, Result, type ResultAsync } from "neverthrow";

import { DBError, ValidationError } from "../../../shared/errors";
import dayjs from "../../../shared/helpers/dayjs";
import { type Event, getOccurrences } from "../objects/read/event";

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

type QueryRange = { from: Date; to: Date };

type UnvalidatedInput = {
  calendarId: string;
  range: { from: string; to: string };
  kind: "unvalidated";
};

export type ValidatedInput = {
  calendarId: string;
  range: QueryRange;
  kind: "validated";
};

type EventQueried = {
  events: Event[];
  range: QueryRange;
  kind: "queried";
};

type EventExpanded = {
  events: EventDto[];
  kind: "expanded";
};

type Validate = (
  command: UnvalidatedInput,
) => Result<ValidatedInput, ValidationError>;

type QueryEvents = (
  command: ValidatedInput,
) => ResultAsync<EventQueried, DBError>;

type ExpandEvents = (
  command: EventQueried,
) => Result<EventExpanded, ExpandError>;

export type GetEvents = (
  calendarId: string,
  range: QueryRange,
) => ResultAsync<Event[], DBError>;

type Workflow = (
  command: UnvalidatedInput,
) => ResultAsync<EventDto[], ValidationError | DBError | ExpandError>;

export const toUnvalidatedQueryCommand = (input: {
  calendarId: string;
  from: string;
  to: string;
}): UnvalidatedInput => {
  return {
    calendarId: input.calendarId,
    range: {
      from: input.from,
      to: input.to,
    },
    kind: "unvalidated",
  };
};

const validate: Validate = (input) => {
  if (input.calendarId.length <= 0) {
    return err(new ValidationError(["InvalidCalendarId"]));
  }
  if (!dayjs(input.range.from).isValid()) {
    return err(new ValidationError(["InvalidFromDate"]));
  }
  if (!dayjs(input.range.to).isValid()) {
    return err(new ValidationError(["InvalidToDate"]));
  }
  if (dayjs(input.range.to).isSameOrBefore(input.range.from)) {
    return err(new ValidationError(["InvalidDateRange"]));
  }

  return ok({
    ...input,
    range: {
      from: new Date(input.range.from),
      to: new Date(input.range.to),
    },
    kind: "validated",
  } as const);
};

const queryEvents =
  (getEvents: GetEvents): QueryEvents =>
  (command) => {
    return ok(command)
      .asyncAndThen(({ calendarId, range }) => {
        return getEvents(calendarId, {
          from: range.from,
          to: range.to,
        });
      })
      .andThen((events) =>
        ok({ kind: "queried", events, range: command.range } as const),
      );
  };

const expandEvents: ExpandEvents = ({ events, range }) => {
  const expanded = events.flatMap((event) => {
    const occurrences = getOccurrences(range)(event);
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

export const queryEventsWorkflow =
  (getEvents: GetEvents): Workflow =>
  (unvalidatedCommand) => {
    return ok(unvalidatedCommand)
      .andThen(validate)
      .asyncAndThen(queryEvents(getEvents))
      .andThen(expandEvents)
      .map((result) => result.events);
  };
