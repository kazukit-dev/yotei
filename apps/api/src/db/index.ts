export * from "./schema";
export * from "./helper";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

import { DefaultLogger } from "drizzle-orm";

export type DB = PostgresJsDatabase<typeof schema>;

export const createDBClient = (
  databaseURL: string,
): PostgresJsDatabase<typeof schema> => {
  const client = postgres(databaseURL, { prepare: false });
  return drizzle(client, { schema, logger: new DefaultLogger() });
};

export type Transaction = Parameters<
  Parameters<ReturnType<typeof createDBClient>["transaction"]>[0]
>[0];
