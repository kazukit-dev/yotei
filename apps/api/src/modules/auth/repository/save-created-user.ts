import { ResultAsync } from "neverthrow";

import {
  createDBClient,
  isUniqueConstraintError,
  userEmail,
  userPassword,
  users,
} from "../../../db";
import { DBError } from "../../../shared/errors";
import { Email } from "../objects/email";
import { UserId } from "../objects/id";
import { UserName } from "../objects/name";
import { HashedPassword } from "../objects/password";

export class AlreadyExistsError extends DBError {}

type CreatedUser = {
  id: UserId;
  name: UserName;
  email: Email;
  hashed_password: HashedPassword;
  kind: "created";
};

export const createUser =
  (db: ReturnType<typeof createDBClient>) =>
  async ({ kind: _, ...user }: CreatedUser) => {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({ id: user.id, name: user.name });
      await tx
        .insert(userPassword)
        .values({ user_id: user.id, hashed_password: user.hashed_password });
      await tx
        .insert(userEmail)
        .values({ user_id: user.id, email: user.email });
    });
    return user;
  };

export const saveCreatedUser =
  (db: ReturnType<typeof createDBClient>) => (createdUser: CreatedUser) => {
    return ResultAsync.fromPromise(
      createUser(db)(createdUser),
      (err: unknown) => {
        if (isUniqueConstraintError(err)) {
          return new AlreadyExistsError(
            "A user with the provided email already exists.",
            { cause: err },
          );
        }
        return new DBError("Failed create user", { cause: err });
      },
    );
  };
