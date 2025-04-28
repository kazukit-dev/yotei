import { Calendar } from "~/models/calendar";

import { ApiError } from "../error";
import apiClient from "../shared/client";
import { CreateCalendarInput } from "./type";

export const findCalendars = async (): Promise<Calendar[]> => {
  const result = await apiClient.get<Calendar[]>("/calendars");
  if (result.ok) {
    return result.data;
  }
  throw new ApiError("Failed to fetch calendars", result.status);
};

export const createCalendar = async (data: CreateCalendarInput) => {
  const result = await apiClient.post<Calendar>("/calendars", data);
  if (result.ok) {
    return result.data;
  }
  throw new ApiError("Failed to create calendar", result.status);
};
