import { err, type Ok, ok, Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import {
  createEnd,
  createStart,
  Duration,
  type End,
  type Start,
  toDuration,
} from "../objects/write/date";
import type { Event } from "../objects/write/event";
import {
  CalendarId,
  createCalendarId,
  generateEventId,
} from "../objects/write/id";
import { createRRule, RRule, type Until } from "../objects/write/rrule";
import { createTitle, Title } from "../objects/write/title";

type WorkflowError = ValidationError;

type UnvalidatedEvent = {
  kind: "unvalidated";
  calendar_id: string;
  title: string;
  start: string;
  end: string;
  is_recurring: boolean;
  is_all_day: boolean;
  rrule?: {
    freq: number;
    until: string;
  };
};

type ValidatedSingleEvent = {
  title: Title;
  calendar_id: CalendarId;
  start: Start;
  end: End;
  duration: Duration;
  is_recurring: false;
  is_all_day: boolean;
};

type ValidatedRecurringEvent = {
  title: Title;
  calendar_id: CalendarId;
  start: Start;
  end: Until;
  duration: Duration;
  rrule: RRule;
  is_recurring: true;
  is_all_day: boolean;
};

type ValidatedEvent = (ValidatedSingleEvent | ValidatedRecurringEvent) & {
  kind: "validated";
};

export type CreatedEvent = Event & { kind: "created" };

type Validate = (
  event: UnvalidatedEvent,
) => Result<ValidatedEvent, ValidationError>;

type CreateEvent = (command: ValidatedEvent) => Ok<CreatedEvent, never>;

type Workflow = (
  command: UnvalidatedEvent,
) => Result<CreatedEvent, WorkflowError>;

export const toUnvalidatedEvent = (
  input: Omit<UnvalidatedEvent, "kind">,
): UnvalidatedEvent => {
  return { ...input, kind: "unvalidated" } as const;
};

export const createEventWorkflow = (): Workflow => (command) => {
  return ok(command).andThen(validate).andThen(createEvent);
};

const validate: Validate = (event) => {
  const calendarId = createCalendarId(event.calendar_id);
  const title = createTitle(event.title);
  const start = createStart(event.start);
  const end = createEnd(event.end);
  const duration = toDuration(event.start, event.end);

  if (!event.is_recurring) {
    const values = Result.combineWithAllErrors(
      tuple(calendarId, title, start, end, duration),
    );
    return values
      .map(([calendarId, title, start, end, duration]) => {
        const data = {
          calendar_id: calendarId,
          title,
          start,
          end,
          duration,
          is_recurring: false,
          is_all_day: event.is_all_day,
        } as const;
        return { kind: "validated", ...data } as const;
      })
      .mapErr((e) => new ValidationError(e));
  }

  if (!event.rrule) {
    return err(new ValidationError(["MissingRRule"]));
  }

  const rrule = createRRule({
    freq: event.rrule.freq,
    dtstart: event.start,
    until: event.rrule.until,
  });
  const values = Result.combineWithAllErrors(
    tuple(calendarId, title, start, duration, rrule),
  );
  return values
    .map(([calendarId, title, start, duration, rrule]) => {
      const data = {
        calendar_id: calendarId,
        title,
        rrule,
        start,
        end: rrule.until,
        duration,
        is_recurring: true,
        is_all_day: event.is_all_day,
      } as const;
      return { kind: "validated", ...data } as const;
    })
    .mapErr((e) => new ValidationError(e));
};

const createEvent: CreateEvent = (event) => {
  return ok({
    ...event,
    kind: "created",
    exceptions: [],
    id: generateEventId(),
  });
};
