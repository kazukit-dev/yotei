import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../../shared/helpers/brand";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Email = Brand<string, "Email">;

export const createEmail = (value: string): Result<Email, string> => {
  return emailRegex.test(value) ? ok(value as Email) : err("Invalid email.");
};
