import { err, ok,type Result } from "neverthrow";

import type { Brand } from "../../helpers/brand";

export type EventId = Brand<string, "EventId">;
export const EventId = {
  create: (value: string): Result<EventId, "InvalidEventId"> => {
    if (!value.length) {
      return err("InvalidEventId");
    }
    return ok(value as EventId);
  },
};

export const generateEventId = (): EventId => {
  return crypto.randomUUID() as EventId;
};

export type CalendarId = Brand<string, "CalendarId">;
export const CalendarId = {
  create: (value: string): Result<CalendarId, "InvalidCalendarId"> => {
    if (!value.length) {
      return err("InvalidCalendarId");
    }
    return ok(value as CalendarId);
  },
} as const;
