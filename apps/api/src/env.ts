export type Bindings = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
};

export type Env = {
  Bindings: Bindings;
};
