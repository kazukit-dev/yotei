import type FullCalendar from "@fullcalendar/react";
import { useRef } from "react";
import { VIEW_TYPE, type ViewType } from "./adaptor";

export const useCalendar = () => {
  const calendarRef = useRef<FullCalendar>(null);

  const changeView = (view: ViewType): void => {
    const api = calendarRef.current?.getApi();
    const viewType = VIEW_TYPE[view];
    api?.changeView(viewType);
  };

  const changeDate = (date: Date): void => {
    const api = calendarRef.current?.getApi();
    api?.gotoDate(date);
  };

  return { calendarRef, changeView, changeDate };
};
