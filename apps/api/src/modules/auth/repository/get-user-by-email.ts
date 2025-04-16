import { eq } from "drizzle-orm";
import { err, ResultAsync } from "neverthrow";

import { DB, userEmail, userPassword, users } from "../../../db";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { Email } from "../objects/email";
import { createUser, User } from "../objects/user";

type RawUser = {
  id: string;
  name: string;
  email: string;
  hashed_password: string;
};

export const findUserByEmail =
  (db: DB) =>
  async (email: Email): Promise<RawUser | null> => {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: userEmail.email,
        hashed_password: userPassword.hashed_password,
      })
      .from(users)
      .innerJoin(userEmail, eq(userEmail.user_id, users.id))
      .innerJoin(userPassword, eq(userPassword.user_id, users.id))
      .where(eq(userEmail.email, email));

    return user.length !== 0 ? user[0] : null;
  };

export const getUserByEmail =
  (db: DB) =>
  (
    email: Email,
  ): ResultAsync<User, EntityNotFound | ValidationError | DBError> => {
    return ResultAsync.fromPromise(
      findUserByEmail(db)(email),
      (error) => new DBError("Failed to get user by email.", { cause: error }),
    ).andThen((user) =>
      user
        ? createUser(user).mapErr((errs) => new ValidationError(errs))
        : err(new EntityNotFound("User not found by the provided email.")),
    );
  };
