import { type Result, err, ok } from "neverthrow";
import type { Brand } from "../../helpers/brand";

export type Title = Brand<string, "Title">;
export const Title = {
  create: (value: string): Result<Title, "InvalidTitle"> => {
    if (0 < value.length && value.length <= 100) {
      return ok(value as Title);
    }
    return err("InvalidTitle");
  },
} as const;
