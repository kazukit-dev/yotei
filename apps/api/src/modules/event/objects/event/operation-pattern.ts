import { err, ok, Result } from "neverthrow";

export const OPERATION_PATTERN = {
  THIS: 0,
  FUTURE: 1,
  ALL: 2,
} as const;

export type OperationPattern =
  (typeof OPERATION_PATTERN)[keyof typeof OPERATION_PATTERN];

export const createOperationPattern = (
  value: number,
): Result<OperationPattern, string> => {
  const values: number[] = Object.values(OPERATION_PATTERN);
  if (!values.includes(value)) {
    return err("InvalidOperationPattern");
  }
  return ok(value as OperationPattern);
};
