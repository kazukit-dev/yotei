import { err, ok, type Result } from "neverthrow";

import type { Brand } from "../../../../shared/helpers/brand";

export type Title = Brand<string, "Title">;

export const createTitle = (value: string): Result<Title, "InvalidTitle"> => {
  if (0 < value.length && value.length <= 100) {
    return ok(value as Title);
  }
  return err("InvalidTitle");
};
