import { Calendar } from "~/models/calendar";

import { handleApiError } from "../error";
import apiClient from "../shared/client";
import { CreateCalendarInput } from "./type";

export const findCalendars = async (): Promise<Calendar[]> => {
  const result = await apiClient.get<Calendar[]>("/calendars");
  if (!result.ok) {
    return handleApiError(result.status);
  }
  return result.data;
};

export const createCalendar = async (data: CreateCalendarInput) => {
  const result = await apiClient.post<Calendar>("/calendars", data);
  if (!result.ok) {
    return handleApiError(result.status);
  }
  return result.data;
};
