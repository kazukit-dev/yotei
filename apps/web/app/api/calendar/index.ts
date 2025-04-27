import { Calendar } from "~/models/calendar";

import { createCalendar, findCalendars } from "./function";
import { CreateCalendarInput } from "./type";

export const getCalendars = async (): Promise<Calendar[]> => {
  return findCalendars();
};

export const createNewCalendar = async (data: CreateCalendarInput) => {
  await createCalendar(data);
};
