import { type Ok, ok, Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import type { CalendarId } from "../../event/objects/write/id";
import { generateCalendarId } from "../objects/write/id";
import { CalendarName, createCalendarName } from "../objects/write/name";
import { createOwnerId, OwnerId } from "../objects/write/owner-id";

export type UnvalidatedCalendar = {
  kind: "unvalidated";
  name: string;
  ownerId: string;
};

export type ValidatedCalendar = {
  kind: "validated";
  name: CalendarName;
  ownerId: OwnerId;
};

export type CreatedCalendar = {
  kind: "created";
  id: CalendarId;
  name: CalendarName;
  ownerId: OwnerId;
};

type ValidateCalendar = (
  model: UnvalidatedCalendar,
) => Result<ValidatedCalendar, ValidationError>;

type CreateCalendar = (model: ValidatedCalendar) => Ok<CreatedCalendar, never>;

type Workflow = (
  command: UnvalidatedCalendar,
) => Result<CreatedCalendar, ValidationError>;

export const toUnvalidatedCalendar = (input: {
  name: string;
  ownerId: string;
}): UnvalidatedCalendar => {
  return {
    kind: "unvalidated",
    name: input.name,
    ownerId: input.ownerId,
  } as const;
};

const validate: ValidateCalendar = (model) => {
  const name = createCalendarName(model.name);
  const ownerId = createOwnerId(model.ownerId);

  const values = Result.combineWithAllErrors([name, ownerId]);

  return values
    .map(([name, ownerId]) => {
      return { ...model, name, ownerId, kind: "validated" } as const;
    })
    .mapErr((e) => new ValidationError(e));
};

const createCalendar: CreateCalendar = (model) => {
  return ok({
    ...model,
    id: generateCalendarId(),
    kind: "created",
  } as const);
};

export const createCalendarWorkflow = (): Workflow => (model) => {
  return ok(model).andThen(validate).andThen(createCalendar);
};
