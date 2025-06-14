import { err, ok, Result } from "neverthrow";

import type { Brand } from "../../../../shared/helpers/brand";
import dayjs from "../../../../shared/helpers/dayjs";
import { tuple } from "../../../../shared/helpers/tuple";

export type ExceptionDate = Brand<Date, "ExceptionDate">;
export type ExceptionType = Brand<string, "modified" | "cancelled">;

interface _Exception {
  target_date: ExceptionDate;
  type: string;
}

interface ModifiedException extends _Exception {
  type: "modified";
}

interface CancelledException extends _Exception {
  type: "cancelled";
}

export type Exception = ModifiedException | CancelledException;

export type UnvalidatedException = {
  target_date: string;
  type: string;
};

export const createExceptionDate = (
  value: string,
): Result<ExceptionDate, string> => {
  return dayjs(value).isValid()
    ? ok(new Date(value) as ExceptionDate)
    : err("InvalidExceptionDate");
};

export const createExceptionType = (
  value: string,
): Result<ExceptionType, "InvalidExceptionType"> => {
  if (value !== "modified" && value !== "cancelled") {
    return err("InvalidExceptionType");
  }
  return ok(value as ExceptionType);
};

export const createException = (
  input: UnvalidatedException,
): Result<Exception, string> => {
  const exceptionDate = createExceptionDate(input.target_date);
  const exceptionType = createExceptionType(input.type);

  const values = Result.combine(tuple(exceptionDate, exceptionType));

  return values.map(([date, type]) => {
    return {
      target_date: date,
      type,
    } as Exception;
  });
};
