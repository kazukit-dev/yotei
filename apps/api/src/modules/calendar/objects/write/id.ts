import { Ok, ok } from "neverthrow";

import type { Brand } from "../../../../shared/helpers/brand";

export type CalendarId = Brand<string, "CalendarId">;

export const generateCalendarId = (): CalendarId => {
  return crypto.randomUUID() as CalendarId;
};

export const createCalendarId = (value: string): Ok<CalendarId, never> => {
  return ok(value as CalendarId);
};
