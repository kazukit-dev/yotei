import { err, ok,Result } from "neverthrow";

import { ValidationError } from "../../common/errors";
import { compare } from "../../helpers/date";
import dayjs from "../../helpers/dayjs";
import { tuple } from "../../helpers/tuple";
import { Duration, type End, type Start, toDates } from "../objects/date";
import type { Event } from "../objects/event/write";
import { updateEvent,UpdatePattern } from "../objects/event/write";
import { ExceptionDate } from "../objects/exception/write";
import { getRecurringDates } from "../objects/rrule/read";
import { Title } from "../objects/title";

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
};

type ValidatedCommand = {
  input: ValidatedInput;
  kind: "validated";
  pattern: UpdatePattern;
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
  const title = Title.create(input.title);
  const dates = toDates({ start: input.start, end: input.end });
  const duration = dates.andThen(Duration.create);
  const targetDate = toExceptionDate(event, input.target_date);
  const pattern = UpdatePattern.create(input.pattern);

  const values = Result.combineWithAllErrors(
    tuple(title, dates, duration, targetDate, pattern),
  );
  return values
    .map(([title, { start, end }, duration, targetDate, pattern]) => ({
      input: {
        title,
        start,
        end,
        duration,
        target_date: targetDate,
        is_all_day: input.is_all_day,
      },
      pattern,
    }))
    .map((updates) => ({ event, ...updates, kind: "validated" }) as const)
    .mapErr((e) => new ValidationError(e));
};

const toExceptionDate = (
  event: Event,
  targetDate: string,
): Result<ExceptionDate, string> => {
  const exceptionDate = ExceptionDate.create(targetDate);
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

const update: UpdateEvent = ({ input, event, pattern }) => {
  return updateEvent(
    input,
    pattern,
  )(event).mapErr((e) => new EventUpdateError(e));
};

export const updateEventWorkflow =
  (): Workflow => (command: UnvalidatedCommand) => {
    return ok(command).andThen(validate).andThen(update);
  };
