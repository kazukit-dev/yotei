import { API_URL } from "~/config";
import type { Event } from "~/models/event";

import client from "../client";
import { ApiError } from "../error";
import type {
  CreateEventInput,
  EventDetailDto,
  EventDto,
  UpdateEventInput,
} from "./type";

export const fetchEventById = async (
  calendarId: string,
  eventId: string,
  targetDate?: string,
) => {
  const url = new URL(`calendars/${calendarId}/events/${eventId}`, API_URL);
  if (targetDate) {
    url.searchParams.append("target_date", targetDate);
  }
  const result = client.get<EventDetailDto>(url);
  return result;
};

export const fetchEvents = async (
  calendarId: string,
  { from, to }: { from: string; to: string },
): Promise<EventDto[]> => {
  const url = new URL(`calendars/${calendarId}/events`, API_URL);
  const result = await client.get<EventDto[]>(url, { from, to });

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
  const url = new URL(`/calendars/${calendarId}/events`, API_URL);
  const result = await client.post<Event>(url, data);
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
  const url = new URL(`/calendars/${calendarId}/events/${eventId}`, API_URL);
  const result = await client.put(url, data);
  if (!result.ok) {
    throw new ApiError("Failed to update event.", result.status);
  }
};
