import { createDBClient } from "../../../db";
import { AuthError } from "../../../shared/errors";
import { createAuthenticatedApp } from "../../../shared/hono/";
import { findUserById } from "../query-service/find-user-by-id";

const app = createAuthenticatedApp<"/users">();

app.get("/me", async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const userId = c.get("userId");

  const me = await findUserById(db)(userId);

  if (!me) {
    throw new AuthError("User not found");
  }

  return c.json(me);
});

export default app;
