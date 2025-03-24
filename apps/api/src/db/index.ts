import { DefaultLogger } from "drizzle-orm";
import { drizzle,type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export * from "./helper";
export * from "./schema";

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
