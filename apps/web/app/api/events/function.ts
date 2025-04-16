import type { Event, OperationPattern } from "~/models/event";

import { ApiError } from "../error";
import client from "../shared/client";
import type {
  CreateEventInput,
  DeleteEventResponse,
  EventDetailDto,
  EventDto,
  UpdateEventInput,
} from "./type";

export const fetchEventById = async (
  calendarId: string,
  eventId: string,
  targetDate?: string,
) => {
  const path = `calendars/${calendarId}/events/${eventId}`;
  const query = targetDate ? { target_date: targetDate } : undefined;
  const result = client.get<EventDetailDto>(path, query);
  return result;
};

export const fetchEvents = async (
  calendarId: string,
  { from, to }: { from: string; to: string },
): Promise<EventDto[]> => {
  const path = `calendars/${calendarId}/events`;
  const result = await client.get<EventDto[]>(path, { from, to });

  if (result.ok) {
    return result.data;
  }
  throw new ApiError("Failed to get events", result.status, {
    cause: result.error,
  });
};

export const createEvent = async (
  calendarId: string,
  data: CreateEventInput,
): Promise<Event> => {
  const path = `/calendars/${calendarId}/events`;
  const result = await client.post<Event>(path, data);
  if (!result.ok) {
    throw new ApiError("Failed to create event.", result.status);
  }
  return result.data;
};

export const updateEvent = async (
  calendarId: string,
  eventId: string,
  data: UpdateEventInput,
) => {
  const path = `/calendars/${calendarId}/events/${eventId}`;
  const result = await client.put(path, data);
  if (!result.ok) {
    throw new ApiError("Failed to update event.", result.status);
  }
};

export const deleteEvent = async (
  calendarId: string,
  eventId: string,
  data: { target_date: string; pattern: OperationPattern },
): Promise<DeleteEventResponse> => {
  const path = `/calendars/${calendarId}/events/${eventId}`;
  const result = await client.delete<DeleteEventResponse>(path, data);
  if (!result.ok) {
    throw new ApiError("Failed to delete event", result.status);
  }
  return result.data;
};
