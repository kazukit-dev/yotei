import { ok, Result } from "neverthrow";

import { tuple } from "../../../shared/helpers/tuple";
import { createEmail, Email } from "./email";
import { createUserId, UserId } from "./id";
import { createUserName, UserName } from "./name";
import { createHashedPassword, HashedPassword } from "./password";

export type User = {
  id: UserId;
  name: UserName;
  email: Email;
  hashed_password: HashedPassword;
};

export const createUser = (input: {
  id: string;
  name: string;
  email: string;
  hashed_password: string;
}): Result<User, string[]> => {
  const userId = createUserId(input.id);
  const name = createUserName(input.name);
  const email = createEmail(input.email);
  const hashedPassword = createHashedPassword(input.hashed_password);

  const values = tuple(userId, name, email, hashedPassword);

  return Result.combineWithAllErrors(values).andThen(
    ([userId, name, email, hashedPassword]) => {
      return ok({
        id: userId,
        name,
        email,
        hashed_password: hashedPassword,
      } as User);
    },
  );
};
