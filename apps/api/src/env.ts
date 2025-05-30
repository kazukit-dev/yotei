import { DB } from "./db";

type Bindings = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;

  OAUTH2_URL: string;
  OAUTH2_REDIRECT_URI: string;
  OAUTH2_CLIENT_ID: string;
  OAUTH2_CLIENT_SECRET: string;
};

type Variables = {
  userId: string;
  db?: DB;
};

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};
