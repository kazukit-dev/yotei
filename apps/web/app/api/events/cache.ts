import dayjs from "dayjs";

import { queryClient } from "~/libs/query-client";
import type { Event, EventDetail } from "~/models/event";

export type Filters = {
  from: string;
  to: string;
};

export const eventKey = {
  all: (calendarId: string) => ["calendars", calendarId, "events"] as const,
  lists: (calendarId: string) => [...eventKey.all(calendarId), "list"] as const,
  list: (calendarId: string, filters: Filters) => [...eventKey.lists(calendarId), filters] as const,
  details: (calendarId: string) => [...eventKey.all(calendarId), "detail"],
  detail: (calendarId: string, eventId: string, date?: string) => {
    const key = [...eventKey.details(calendarId), eventId, date ? date : null] as const;
    return key;
  },
} as const;

export const getEventListCache = (calendarId: string, filters: Filters): Event[] | null => {
  const cacheKey = eventKey.list(calendarId, filters);
  const cache = queryClient.getQueryData(cacheKey);
  return cache as Event[] | null;
};

export const setEventListCache = (calendarId: string, filters: Filters, data: Event[]) => {
  const cacheKey = eventKey.list(calendarId, filters);
  queryClient.setQueryData(cacheKey, data);
};

export const removeEventListCache = (
  calendarId: string,
  eventRange: { start: string; end: string },
) => {
  queryClient.removeQueries<
    unknown,
    Error,
    ReturnType<(typeof eventKey)["list"] | (typeof eventKey)["lists"]>
  >({
    queryKey: eventKey.lists(calendarId),
    predicate: (query) => {
      const queryKey = query.queryKey;
      const filters = queryKey[4];
      if (!filters) return false;
      return inRange(eventRange, filters);
    },
  });
};

const inRange = (
  eventRange: { start: string; end: string },
  filters: { from: string; to: string },
): boolean => {
  const from = dayjs(filters.from);
  const to = dayjs(filters.to);

  return (
    dayjs(from).isBefore(eventRange.end) ||
    dayjs(eventRange.start).isBefore(to) ||
    (dayjs(eventRange.start).isBefore(from) && dayjs(to).isBefore(eventRange.end))
  );
};

export const getEventDetailCache = (
  calendarId: string,
  eventId: string,
  targetDate?: string,
): EventDetail | null => {
  const cacheKey = eventKey.detail(calendarId, eventId, targetDate);
  const cache = queryClient.getQueryData(cacheKey);
  if (!cache) return null;
  return cache as EventDetail;
};

export const setEventDetailCache = (calendarId: string, data: EventDetail): void => {
  const cacheKey = eventKey.detail(calendarId, data.id, data.start.toISOString());
  queryClient.setQueryData(cacheKey, data);
};

export const removeEventDetailCache = (
  calendarId: string,
  eventId: string,
  targetDate?: string,
): void => {
  const cacheKey = eventKey.detail(calendarId, eventId, targetDate);
  queryClient.removeQueries({ queryKey: cacheKey });
};
