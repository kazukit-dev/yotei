import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../shared/helpers/brand";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

export type Password = Brand<string, "Password">;

export type HashedPassword = Brand<string, "HashedPassword">;

const hasUpperCase = (str: string) => {
  return /[A-Z]/.test(str);
};
const hasLowerCase = (str: string) => {
  return /[a-z]/.test(str);
};
const hasNumber = (str: string) => {
  return /[0-9]/.test(str);
};

export const createPassword = (value: string): Result<Password, string> => {
  if (value.length === 0) {
    return err("Password cannot be empty");
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return err(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return err(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }

  if (!hasLowerCase(value) || !hasUpperCase(value) || !hasNumber(value)) {
    return err(
      "Password must include at least one uppercase letter, one lowercase letter, and one number",
    );
  }

  return ok(value as Password);
};

export const hashPassword = (password: Password): HashedPassword => {
  const salt = randomBytes(16).toString("hex");

  const derivedKey = scryptSync(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}` as HashedPassword;
};

export const createHashedPassword = (
  value: string,
): Result<HashedPassword, string> => {
  return ok(value as HashedPassword);
};

export const verifyPassword = (
  providedPassword: string,
  storedPassword: string,
) => {
  const [salt, hash] = storedPassword.split(":");

  const derivedKey = scryptSync(providedPassword, salt, 64);

  // 計算されたハッシュと保存されたハッシュを比較
  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(derivedKey.toString("hex"), "hex"),
  );
};
