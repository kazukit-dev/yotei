import { err, ok, Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import { compare } from "../../../shared/helpers/date";
import dayjs from "../../../shared/helpers/dayjs";
import { tuple } from "../../../shared/helpers/tuple";
import {
  createEnd,
  createStart,
  Duration,
  type End,
  type Start,
  toDuration,
} from "../objects/date";
import {
  createOperationPattern,
  OperationPattern,
} from "../objects/event/operation-pattern";
import type { Event } from "../objects/event/write";
import { updateEvent } from "../objects/event/write";
import { createExceptionDate, ExceptionDate } from "../objects/exception/write";
import { getRecurringDates } from "../objects/rrule/read";
import { createTitle, Title } from "../objects/title";

class EventUpdateError extends Error {}

type WorkflowError = ValidationError | EventUpdateError;

type UnvalidatedInput = {
  title: string;
  start: string;
  end: string;
  target_date: string;
  is_all_day: boolean;
  pattern: number;
};

type UnvalidatedCommand = {
  kind: "unvalidated";
  input: UnvalidatedInput;
  event: Event;
};

type ValidatedInput = {
  target_date: ExceptionDate;
  title: Title;
  start: Start;
  end: End;
  duration: Duration;
  is_all_day: boolean;
  pattern: OperationPattern;
};

type ValidatedCommand = {
  input: ValidatedInput;
  kind: "validated";
  event: Event;
};

type UpdatedEvent = {
  update: Event & { kind: "updated" };
  create?: Event & { kind: "created" };
};

type Validate = (
  command: UnvalidatedCommand,
) => Result<ValidatedCommand, ValidationError>;

type UpdateEvent = (
  command: ValidatedCommand,
) => Result<UpdatedEvent, EventUpdateError>;

type Workflow = (
  command: UnvalidatedCommand,
) => Result<UpdatedEvent, WorkflowError>;

export const toUnvalidateUpdateCommand = (
  input: UnvalidatedInput,
  event: Event,
): UnvalidatedCommand => ({
  input,
  event,
  kind: "unvalidated",
});

const validate: Validate = ({ input, event }) => {
  const title = createTitle(input.title);
  const start = createStart(input.start);
  const end = createEnd(input.end);
  const duration = toDuration(input.start, input.end);
  const targetDate = toExceptionDate(event, input.target_date);
  const pattern = createOperationPattern(input.pattern);

  const values = Result.combineWithAllErrors(
    tuple(title, start, end, duration, targetDate, pattern),
  );
  return values
    .map(([title, start, end, duration, targetDate, pattern]) => ({
      input: {
        title,
        start,
        end,
        duration,
        target_date: targetDate,
        is_all_day: input.is_all_day,
        pattern,
      },
    }))
    .mapErr((e) => new ValidationError(e))
    .map((updates) => ({ event, ...updates, kind: "validated" }) as const);
};

const toExceptionDate = (
  event: Event,
  targetDate: string,
): Result<ExceptionDate, string> => {
  const exceptionDate = createExceptionDate(targetDate);
  if (!event.is_recurring) {
    return exceptionDate.andThen((date) => {
      return ok(date);
    });
  }

  return exceptionDate.andThen((date) => {
    // event dates
    const from = dayjs(event.start).startOf("day").toDate();
    const to = dayjs(event.end).endOf("day").toDate();
    const recurringDates = getRecurringDates(from, to)(event.rrule);
    const foundEventDate = recurringDates.find((date) =>
      compare(date, "=", date),
    );

    // exception dates
    const exceptionDates = event.exceptions.map(
      (exception) => exception.target_date,
    );
    const foundException = exceptionDates.find((exDate) =>
      compare(exDate, "=", date),
    );

    if (!foundEventDate && !foundException) {
      return err("InvalidTargetDate");
    }

    return ok(date);
  });
};

const update: UpdateEvent = ({ input, event }) => {
  return updateEvent(event, input).mapErr((e) => new EventUpdateError(e));
};

export const updateEventWorkflow =
  (): Workflow => (command: UnvalidatedCommand) => {
    return ok(command).andThen(validate).andThen(update);
  };
