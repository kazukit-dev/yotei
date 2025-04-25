import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { ok } from "neverthrow";

import { createDBClient } from "../../../db";
import { transaction } from "../../../shared/db/transaction";
import { createEmail } from "../objects/email";
import { createRefreshToken, hashRefreshToken } from "../objects/token";
import { getUserByEmail } from "../repository/get-user-by-email";
import { getUserTokenByToken } from "../repository/get-user-token";
import { deleteToken, revokeToken } from "../repository/revoke-token";
import {
  AlreadyExistsError,
  saveCreatedUser,
} from "../repository/save-created-user";
import {
  createUserToken,
  saveCreatedUserToken,
} from "../repository/save-created-user-token";
import {
  refreshWorkflow,
  toUnverifiedRefreshCommand,
} from "../workflow/refresh";
import { signinWorkflow, toUnvalidatedSigninCommand } from "../workflow/signin";
import {
  signoutWorkflow,
  toUnverifiedSignoutCommand,
} from "../workflow/signout";
import { signupWorkflow, toUnvalidatedSignupCommand } from "../workflow/signup";
import {
  refreshSchema,
  signinSchema,
  signoutSchema,
  signupSchema,
} from "./schema";

type Bindings = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }, BlankSchema, "/auth">();

app.post("/signup", zValidator("json", signupSchema), async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const body = c.req.valid("json");

  const workflow = signupWorkflow();

  const command = toUnvalidatedSignupCommand(body);
  const preprocess = ok(command)
    .andThen(workflow)
    .asyncAndThen(saveCreatedUser(db));

  return preprocess.match(
    () => {
      return c.json(201);
    },
    (err) => {
      if (err instanceof AlreadyExistsError) {
        return c.json(err.message, 409);
      }
      throw err;
    },
  );
});

app.post("/signin", zValidator("json", signinSchema), async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const body = c.req.valid("json");

  const workflow = signinWorkflow(c.env.ACCESS_TOKEN_SECRET);
  const preprocess = ok(body.email)
    .andThen(createEmail)
    .asyncAndThen(getUserByEmail(db))
    .map((user) => {
      return toUnvalidatedSigninCommand(user, body.password);
    });
  const result = preprocess.andThen(workflow).andThen((res) => {
    return saveCreatedUserToken(db)(res.userToken).map(() => res.tokens);
  });

  return await result.match(
    (tokens) => c.json(tokens, 200),
    (err) => {
      throw err;
    },
  );
});

app.post("/refresh", zValidator("json", refreshSchema), async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const { refresh_token } = c.req.valid("json");

  const workflow = refreshWorkflow(c.env.ACCESS_TOKEN_SECRET);

  const preprocess = ok(refresh_token)
    .andThen(createRefreshToken)
    .andThen(hashRefreshToken)
    .asyncAndThen(getUserTokenByToken(db))
    .map(toUnverifiedRefreshCommand);

  const result = preprocess
    .andThen(workflow)
    .andThrough((command) => {
      return transaction(db)(async (tx) => {
        await createUserToken(tx)(command.createdUserToken);
        await deleteToken(tx)(command.revokedToken);
      });
    })
    .andThen((t) => ok(t.tokens));

  return await result.match(
    (t) => c.json(t, 200),
    (err) => {
      throw err;
    },
  );
});

app.post("/signout", zValidator("json", signoutSchema), async (c) => {
  const db = createDBClient(c.env.DATABASE_URL);
  const { refresh_token } = c.req.valid("json");

  const workflow = signoutWorkflow();

  const preprocess = ok(refresh_token)
    .andThen(createRefreshToken)
    .andThen(hashRefreshToken)
    .asyncAndThen(getUserTokenByToken(db))
    .map(toUnverifiedSignoutCommand);

  const result = preprocess.andThen(workflow).andThen(revokeToken(db));

  return await result.match(
    () => c.body(null, 204),
    (err) => {
      throw err;
    },
  );
});

export default app;
