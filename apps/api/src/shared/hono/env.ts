type Bindings = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;

  OAUTH2_URL: string;
  OAUTH2_REDIRECT_URI: string;
  OAUTH2_CLIENT_ID: string;
  OAUTH2_CLIENT_SECRET: string;
};

type AuthenticatedVariables = {
  userId: string;
};

export type Env = {
  Bindings: Bindings;
};

export type AuthenticatedEnv = {
  Bindings: Bindings;
  Variables: AuthenticatedVariables;
};
