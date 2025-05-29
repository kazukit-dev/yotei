import { zValidator } from "@hono/zod-validator";
import { createApp } from "../../../shared/hono";
import { signinSchema } from "./schema";
import {
  signinWorkflow,
  toUnvalidatedSigninCommand,
} from "../workflows/signin";
import { createDBClient } from "../../../db";
import { saveSession } from "../repositories/save-session";
import { authenticate } from "../middlewares/authenticate";
import { createAuth0Provider } from "../provider/auth0";
import { findOauthUser } from "../repositories/find-oauth-user";
import { saveOauthUser } from "../repositories/save-oauth-user";
import { setSession } from "./session";

const app = createApp<"/auth">();

app.post("/signin", zValidator("json", signinSchema), async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const input = c.req.valid("json");

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
        return c.json(undefined, 201);
      },
      (err) => {
        console.error("Failed to signin", err);
        throw err;
      },
    );
});

app.get("/status", authenticate, async (c) => {
  // find user by user_id
  // return
});

export default app;
