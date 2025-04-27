import { err, ok, Result } from "neverthrow";

import type { Brand } from "../../../../shared/helpers/brand";

export type CalendarName = Brand<string, "Name">;

const MAX_NAME_LENGTH = 256;

export const createCalendarName = (
  value: string,
): Result<CalendarName, string> => {
  if (0 >= value.length || value.length > MAX_NAME_LENGTH) {
    return err("Invalid calendar name length");
  }
  return ok(value as CalendarName);
};
