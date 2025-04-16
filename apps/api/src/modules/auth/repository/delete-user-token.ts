import { eq } from "drizzle-orm";

import { DB, userToken } from "../../../db";
import { HashedRefreshToken } from "../objects/token";

type DeletedUserToken = {
  kind: "deleted";
  token: HashedRefreshToken;
};

export const deleteUserToken =
  (db: DB) =>
  async ({ token }: DeletedUserToken): Promise<void> => {
    await db.delete(userToken).where(eq(userToken.token, token));
  };
