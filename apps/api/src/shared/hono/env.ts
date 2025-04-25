type Bindings = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
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
