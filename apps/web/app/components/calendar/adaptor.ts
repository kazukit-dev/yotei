import type { EventClickArg, EventInput } from "@fullcalendar/core/";
import type { Event } from "~/models/event";
import { format } from "~/utils/day";

export type FullCalendarEvent = EventInput;

export type ViewType = "month" | "week";

export const VIEW_TYPE = {
  week: "timeGridWeek",
  month: "dayGridMonth",
} as const;

export const convertEvent = (event: Event): FullCalendarEvent => {
  const customStart = event.is_all_day
    ? format(event.start, "YYYY-MM-DD")
    : event.start.toISOString();

  const customEnd = event.is_all_day
    ? format(event.end, "YYYY-MM-DD")
    : event.end.toISOString();

  return {
    id: `${event.id}-${customStart}`,
    title: event.title,
    start: customStart,
    end: customEnd,
    allDay: event.is_all_day,
    extendedProps: {
      ...event,
    },
  };
};

export const clickEvent = (clickInfo: EventClickArg) => {
  const mouseEvent = clickInfo.jsEvent;
  const event = clickInfo.event;

  return {
    mouseEvent,
    event: event.extendedProps as Event,
  };
};
