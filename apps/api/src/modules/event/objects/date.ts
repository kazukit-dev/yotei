import dayjs from "dayjs";
import { err, ok, Result } from "neverthrow";

import type { Brand } from "../../../shared/helpers/brand";
import { isValidDate } from "../../../shared/helpers/date";

type ExpectedDate = string | number | Date;

export type Start = Brand<Date, "Start">;
export const createStart = (
  value: string | number | Date,
): Result<Start, "InvalidStartDate"> => {
  return isValidDate(value)
    ? ok(new Date(value) as Start)
    : err("InvalidStartDate");
};

export type End = Brand<Date, "End">;
export const createEnd = (
  value: string | number | Date,
): Result<End, "InvalidEndDate"> => {
  return isValidDate(value)
    ? ok(new Date(value) as End)
    : err("InvalidEndDate");
};

export type Duration = Brand<number, "Duration">;

export const toDuration = (
  start: ExpectedDate,
  end: ExpectedDate,
): Result<Duration, string> => {
  if (!isValidDate(start)) {
    return err("InvalidStartDate");
  }
  if (!isValidDate(end)) {
    return err("InvalidEndDate");
  }
  const diff = dayjs(end).diff(start);
  if (diff < 0) {
    return err("InvalidDuration");
  }
  return ok(diff as Duration);
};

export const createDuration = (
  value: number,
): Result<Duration, "InvalidDuration"> => {
  if (value < 0) {
    return err("InvalidDuration");
  }
  return ok(value as Duration);
};
