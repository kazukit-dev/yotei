import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ok } from "neverthrow";

import { AuthenticatedEnv } from "../../../env";
import { authenticate } from "../middlewares/authenticate";
import { createSessionId } from "../objects/session";
import { createAuth0Provider } from "../provider/auth0";
import { deleteSession } from "../repositories/delete-session";
import { findOauthUser } from "../repositories/find-oauth-user";
import { saveOauthUser } from "../repositories/save-oauth-user";
import { saveSession } from "../repositories/save-session";
import {
  signinWorkflow,
  toUnvalidatedSigninCommand,
} from "../workflows/signin";
import { signinSchema } from "./schema";
import { clearSession, getSession, setSession } from "./session";

const app = new Hono<AuthenticatedEnv>();

app.post("/signin", zValidator("json", signinSchema), async (c) => {
  const db = c.get("db");
  const input = c.req.valid("json");

  const sessionId = await getSession(c);
  if (sessionId) {
    return c.json({ message: "Already signed in" }, 200);
  }

  const authUrl = c.env.OAUTH2_URL;
  const clientId = c.env.OAUTH2_CLIENT_ID;
  const clientSecret = c.env.OAUTH2_CLIENT_SECRET;

  const authContext = {
    clientId,
    clientSecret,
    baseUrl: authUrl,
    redirectUri: c.env.OAUTH2_REDIRECT_URI,
  };
  const provider = createAuth0Provider(authContext);
  const command = toUnvalidatedSigninCommand(input);
  const workflow = signinWorkflow(
    clientId,
    provider,
    findOauthUser(db),
    saveOauthUser(db),
  );

  return await workflow(command)
    .andThrough(({ session }) => saveSession(db)(session))
    .match(
      async ({ session }) => {
        const sessionId = session.id;
        await setSession(c, sessionId, session.max_age);
        return c.json({ message: "Signed in successfully" }, 201);
      },
      (err) => {
        console.error("Failed to signin", err);
        throw err;
      },
    );
});

app.post("/signout", authenticate, async (c) => {
  const db = c.get("db");
  const sessionId = await getSession(c);

  return ok(sessionId)
    .andThen(createSessionId)
    .asyncAndThen(deleteSession(db))
    .match(
      () => {
        clearSession(c);
        console.log("Session deleted successfully");
        return c.body(null, 204);
      },
      (err) => {
        console.error("Failed to delete session", err);
        throw err;
      },
    );
});
export default app;
