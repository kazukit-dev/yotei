import { Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import {
  deleteEvent,
  Event,
  getAffectedRange,
  OperationPattern,
} from "../objects/event/write";
import { ExceptionDate } from "../objects/exception/write";
import { EventId } from "../objects/id";

class EventDeleteError extends Error {}

type WorkflowError = ValidationError | EventDeleteError;

type UnvalidatedCommand = {
  kind: "unvalidated";
  event: Event;
  input: { pattern: number; target_date: string };
};
type ValidatedCommand = {
  kind: "validated";
  event: Event;
  input: { pattern: OperationPattern; target_date: ExceptionDate };
};
type Validate = (
  command: UnvalidatedCommand,
) => Result<ValidatedCommand, ValidationError>;

type DeletedEvent = {
  kind: "deleted";
  event: { id: EventId; kind: "deleted" } | (Event & { kind: "updated" });
  affected_range: { start: Date; end: Date };
};

type DeleteEvent = (
  command: ValidatedCommand,
) => Result<DeletedEvent, EventDeleteError>;

type DeleteEventWorkflow = (
  command: UnvalidatedCommand,
) => Result<DeletedEvent, WorkflowError>;

const validate: Validate = (command: UnvalidatedCommand) => {
  const pattern = OperationPattern.create(command.input.pattern);
  const exceptionDate = ExceptionDate.create(command.input.target_date);

  const values = Result.combineWithAllErrors([pattern, exceptionDate]);

  return values
    .map(([pattern, exceptionDate]) => {
      return {
        kind: "validated",
        event: command.event,
        input: {
          pattern,
          target_date: exceptionDate,
        },
      } as const;
    })
    .mapErr((errs) => new ValidationError(errs));
};

const _delete: DeleteEvent = ({ input, event }: ValidatedCommand) => {
  const affectedRange = getAffectedRange(event, input);
  return deleteEvent(event, input)
    .mapErr((e) => new EventDeleteError(e))
    .map(
      (event) =>
        ({
          kind: "deleted",
          event,
          affected_range: affectedRange,
        }) as const,
    );
};

export const toUnvalidatedDeleteCommand = ({
  event,
  pattern,
  target_date,
}: {
  event: Event;
  target_date: string;
  pattern: number;
}): UnvalidatedCommand => {
  return {
    event: event,
    input: { pattern, target_date },
    kind: "unvalidated",
  };
};

export const deleteEventWorkflow: DeleteEventWorkflow = (
  command: UnvalidatedCommand,
) => {
  return validate(command).andThen(_delete);
};
