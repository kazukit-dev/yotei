import { type Result, err, ok } from "neverthrow";
import type { Brand } from "../../helpers/brand";

export type Name = Brand<string, "Name">;

const MAX_NAME_LENGTH = 256;

export const Name = {
  create: (value: string): Result<Name, string> => {
    if (0 < value.length && value.length <= MAX_NAME_LENGTH) {
      return ok(value as Name);
    }
    return err("InvalidName");
  },
} as const;
