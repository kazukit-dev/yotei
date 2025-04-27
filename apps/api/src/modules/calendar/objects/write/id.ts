import type { Brand } from "../../../../shared/helpers/brand";

export type CalendarId = Brand<string, "CalendarId">;

export const generateCalendarId = (): CalendarId => {
  return crypto.randomUUID() as CalendarId;
};
