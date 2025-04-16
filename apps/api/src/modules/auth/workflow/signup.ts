import { Ok, ok, Result } from "neverthrow";

import { ValidationError } from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import { createEmail, Email } from "../objects/email";
import { generateUserId, UserId } from "../objects/id";
import { createUserName, UserName } from "../objects/name";
import {
  createPassword,
  HashedPassword,
  hashPassword,
  Password,
} from "../objects/password";

type WorkflowError = ValidationError;

type UnvalidateCommand = {
  kind: "unvalidated";
  name: string;
  email: string;
  password: string;
};

type ValidatedCommand = {
  kind: "validated";
  name: UserName;
  email: Email;
  password: Password;
};

type CreatedUser = {
  kind: "created";
  id: UserId;
  name: UserName;
  email: Email;
  hashed_password: HashedPassword;
};

type Validate = (
  command: UnvalidateCommand,
) => Result<ValidatedCommand, ValidationError>;

type CreateUser = (command: ValidatedCommand) => Ok<CreatedUser, never>;

type Workflow = (
  command: UnvalidateCommand,
) => Result<CreatedUser, WorkflowError>;

export const toUnvalidatedSignupCommand = (input: {
  name: string;
  password: string;
  email: string;
}): UnvalidateCommand => {
  return { kind: "unvalidated", ...input } as const;
};

const validate: Validate = (model) => {
  const userName = createUserName(model.name);
  const password = createPassword(model.password);
  const email = createEmail(model.email);
  const values = tuple(userName, password, email);

  return Result.combineWithAllErrors(values)
    .map(([userName, password, email]) => {
      return {
        kind: "validated",

        name: userName,
        email,
        password,
      } as const;
    })
    .mapErr((e) => new ValidationError(e));
};

const createNewUser: CreateUser = ({ password, ...model }) => {
  return ok({
    ...model,
    hashed_password: hashPassword(password),
    id: generateUserId(),
    kind: "created",
  });
};

export const signupWorkflow = (): Workflow => (command) => {
  return ok(command).andThen(validate).andThen(createNewUser);
};
