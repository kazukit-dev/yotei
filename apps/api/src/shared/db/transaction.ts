import { ResultAsync } from "neverthrow";

import { DB, Transaction } from "../../db";
import { DBError } from "../errors";

export const transaction =
  (db: DB) =>
  <T>(fn: (tx: Transaction) => Promise<T>): ResultAsync<T, DBError> => {
    return ResultAsync.fromPromise(
      db.transaction<T>(async (tx) => {
        return (await fn(tx)) as T;
      }),
      (err) => new DBError("Failed to execute transaction.", { cause: err }),
    );
  };
