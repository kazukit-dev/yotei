import { eq } from "drizzle-orm";

import { DB, userEmail, users } from "../../../db";
import { type User } from "../objects/read/user";

export const findUserById =
  (db: DB) =>
  async (userId: string): Promise<User | null> => {
    const dbUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: userEmail.email,
      })
      .from(users)
      .innerJoin(userEmail, eq(users.id, userEmail.user_id))
      .limit(1)
      .where(eq(users.id, userId));

    if (!dbUser.length) {
      return null;
    }
    const user = dbUser[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  };
