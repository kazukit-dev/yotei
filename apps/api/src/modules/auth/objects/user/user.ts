import { Result } from "neverthrow";
import { tuple } from "../../../../shared/helpers/tuple";
import { createEmail, Email } from "./email";
import { UserId } from "./user-id";
import { createUserName, UserName } from "./name";

export type User = {
  id: UserId;
  name: UserName;
  email: Email;
};

export const createUser = (dto: {
  id: string;
  name: string;
  email: string;
}): Result<User, string[]> => {
  const email = createEmail(dto.email);
  const name = createUserName(dto.name);

  const values = tuple(email, name);

  return Result.combineWithAllErrors(values).map(([email, name]) => ({
    id: dto.id as UserId,
    name,
    email,
  }));
};
