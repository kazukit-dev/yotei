import dayjs from "dayjs";
import { err, ok, Result } from "neverthrow";

import type { Brand } from "../../helpers/brand";
import { compare, isValidDate } from "../../helpers/date";

export type Start = Brand<Date, "Start">;
export const Start = {
  create: (value: string | number | Date): Result<Start, "InvalidDate"> => {
    return toDate(value);
  },
} as const;

export type End = Brand<Date, "End">;
export const End = {
  create: (value: string | number | Date): Result<End, "InvalidDate"> => {
    return toDate(value);
  },
} as const;

export type Duration = Brand<number, "Duration">;
export const Duration = {
  // parameter をstart ,end にした方が良い
  create: (input: {
    start: Date;
    end: Date;
  }): Result<Duration, "InvalidDuration"> => {
    const diff = dayjs(input.end).diff(input.start);
    if (diff < 0) {
      return err("InvalidDuration");
    }
    return ok(diff as Duration);
  },
  from: (value: number): Result<Duration, "InvalidDuration"> => {
    if (value <= 0) {
      return err("InvalidDuration");
    }
    return ok(value as Duration);
  },
} as const;

const toDate = <T extends Date>(
  value: string | number | Date,
): Result<T, "InvalidDate"> => {
  return isValidDate(value) ? ok(new Date(value) as T) : err("InvalidDate");
};

export const toDates = (input: {
  start: string;
  end: string;
}): Result<{ start: Start; end: End }, string> => {
  const start = Start.create(input.start);
  const end = End.create(input.end);

  const values = Result.combine([start, end]);
  return values.andThen(([start, end]) => {
    if (compare(start, ">", end)) {
      return err("InvalidDateRange");
    }
    return ok({ start, end });
  });
};
