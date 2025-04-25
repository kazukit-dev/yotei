import { eq } from "drizzle-orm";

import { DB, userEmail, users } from "../../../db";
import { type User } from "../objects/read/user";

export const findUserById =
  (db: DB) =>
  async (userId: string): Promise<User | null> => {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: userEmail.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(userEmail, eq(users.id, userEmail.user_id));

    if (!user.length) {
      return null;
    }
    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
    };
  };
