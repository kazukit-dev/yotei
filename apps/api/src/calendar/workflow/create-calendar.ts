import { type Ok, ok,Result } from "neverthrow";

import { ValidationError } from "../../common/errors";
import type { CalendarId } from "../../event/objects/id";
import { tuple } from "../../helpers/tuple";
import type {} from "../objects/calendar/write";
import { generateCalendarId } from "../objects/id";
import { Name } from "../objects/name";

export type UnvalidatedCalendar = {
  kind: "unvalidated";
  name: string;
};

export type ValidatedCalendar = {
  kind: "validated";
  name: Name;
};

export type CreatedCalendar = {
  kind: "created";
  id: CalendarId;
  name: Name;
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
}): UnvalidatedCalendar => {
  return { kind: "unvalidated", name: input.name } as const;
};

const validate: ValidateCalendar = (model) => {
  const name = Name.create(model.name);

  return Result.combine(tuple(name))
    .map(([name]) => ({ ...model, name, kind: "validated" }) as const)
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
