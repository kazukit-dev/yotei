import { ResultAsync } from "neverthrow";
import { DBError } from "../../common/errors";
import type { Transaction, createDBClient } from "../../db";

export const transaction =
  (client: ReturnType<typeof createDBClient>) =>
  <T>(fn: (tx: Transaction) => Promise<T>): ResultAsync<T, DBError> => {
    return ResultAsync.fromPromise(
      client.transaction<T>(async (tx) => {
        return (await fn(tx)) as T;
      }),
      (err) => new DBError("Failed to execute transaction.", { cause: err }),
    );
  };

export const transaction2 = (db: ReturnType<typeof createDBClient>) => {
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      return tx;
    }),
    (err) => new DBError("Failed to execute transaction.", { cause: err }),
  );
};
