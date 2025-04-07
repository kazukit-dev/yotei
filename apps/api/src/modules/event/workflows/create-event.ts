import { err, type Ok, ok, Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import { Duration, type End, type Start, toDates } from "../objects/date";
import type { Event } from "../objects/event/write";
import { CalendarId, generateEventId } from "../objects/id";
import { RRule, type Until } from "../objects/rrule/write";
import { Title } from "../objects/title";

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
  const calendarId = CalendarId.create(event.calendar_id);
  const title = Title.create(event.title);
  const dates = toDates({ start: event.start, end: event.end });
  const duration = dates.andThen(Duration.create);

  if (!event.is_recurring) {
    const values = Result.combineWithAllErrors(
      tuple(calendarId, title, dates, duration),
    );
    return values
      .map(([calendarId, title, { start, end }, duration]) => {
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

  const rrule = RRule.create({
    freq: event.rrule.freq,
    dtstart: event.start,
    until: event.rrule.until,
  });
  const values = Result.combineWithAllErrors(
    tuple(calendarId, title, dates, duration, rrule),
  );
  return values
    .map(([calendarId, title, { start }, duration, rrule]) => {
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
