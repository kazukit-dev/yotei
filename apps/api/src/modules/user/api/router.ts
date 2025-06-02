import { Hono } from "hono";

import { createDBClient } from "../../../db";
import { AuthenticatedEnv } from "../../../env";
import { AuthError } from "../../../shared/errors";
import { findUserById } from "../query-services/find-user-by-id";

const app = new Hono<AuthenticatedEnv>();

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
