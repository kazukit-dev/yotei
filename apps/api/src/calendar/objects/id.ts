import type { Brand } from "../../helpers/brand";

export type CalendarId = Brand<string, "CalendarId">;

export const generateCalendarId = () => {
  return crypto.randomUUID() as CalendarId;
};
