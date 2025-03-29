import type { Event, EventDetail, OperationPattern } from "~/models/event";

import {
  getEventDetailCache,
  getEventListCache,
  removeEventDetailCache,
  removeEventListCache,
  setEventDetailCache,
  setEventListCache,
} from "./cache";
import {
  createEvent,
  deleteEvent as _deleteEvent,
  fetchEventById,
  fetchEvents,
  updateEvent as _updateEvent,
} from "./function";
import { toDomain, toEventDetailDomain } from "./transform";
import type { CreateEventInput, UpdateEventInput } from "./type";

export const getEventDetail = async (
  calendarId: string,
  eventId: string,
  targetDate?: string,
): Promise<EventDetail> => {
  const cache = getEventDetailCache(calendarId, eventId, targetDate);
  if (cache) return cache;
  const result = await fetchEventById(calendarId, eventId, targetDate);
  if (!result.ok) {
    throw new Error("Failed to fetch event.");
  }
  const event = toEventDetailDomain(result.data);
  setEventDetailCache(calendarId, event);
  return event;
};

export const getEvents = async (
  calendarId: string,
  from: string,
  to: string,
): Promise<Event[]> => {
  const cache = getEventListCache(calendarId, { from, to });
  if (cache) return cache;
  const data = await fetchEvents(calendarId, { from, to });
  const events = data.map(toDomain);
  setEventListCache(calendarId, { from, to }, events);
  return events;
};

export const createNewEvent = async (
  calendarId: string,
  data: CreateEventInput,
): Promise<void> => {
  await createEvent(calendarId, data);
  removeEventListCache(calendarId, {
    start: data.start,
    end: data.end,
  });
};

export const updateEvent = async (
  calendarId: string,
  eventId: string,
  data: UpdateEventInput,
) => {
  await _updateEvent(calendarId, eventId, data);
  removeEventListCache(calendarId, { start: data.start, end: data.end });
  removeEventDetailCache(calendarId, eventId);
};

export const deleteEvent = async (
  calendarId: string,
  eventId: string,
  data: {
    target_date: string;
    pattern: OperationPattern;
  },
) => {
  const { affected_range } = await _deleteEvent(calendarId, eventId, data);

  removeEventListCache(calendarId, affected_range);
  removeEventDetailCache(calendarId, eventId);
};
