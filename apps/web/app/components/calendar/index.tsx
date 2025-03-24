import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { forwardRef } from "react";

import type { Event } from "~/models/event";

import { clickEvent, convertEvent,VIEW_TYPE, type ViewType } from "./adaptor";
import { Header } from "./header";
import { useCalendar } from "./hook";

export type { ViewType } from "./adaptor";

export type OnChangeView = (view: ViewType) => void;
export type OnChangeDate = (date: Date) => void;
export type OnClickEvent = (info: {
  mouseEvent: MouseEvent;
  event: Event;
}) => void;

export interface Props {
  events: Event[];
  view?: "month" | "week";
  date?: Date;
  isLoading?: boolean;
  onChangeView?: OnChangeView;
  onChangeDate?: OnChangeDate;
  onClickEvent?: OnClickEvent;
  onAddEvent?: () => void;
}

const Calendar = forwardRef<unknown, Props>(
  (
    {
      date = new Date(),
      events,
      isLoading = false,
      view = "month",
      onClickEvent,
      onChangeDate,
      onChangeView,
      onAddEvent,
    },
    _ref,
  ) => {
    const initialView = VIEW_TYPE[view];
    const fullCalendarEvents = events.map(convertEvent);

    const { calendarRef, changeDate, changeView } = useCalendar();

    const handleChangeView = (view: ViewType) => {
      changeView(view);
      onChangeView?.(view);
    };
    const handleChangeDate = (date: Date) => {
      changeDate(date);
      onChangeDate?.(date);
    };

    return (
      <div className="flex flex-col gap-3">
        <Header
          date={date}
          view={view}
          isLoading={isLoading}
          onChangeView={handleChangeView}
          onChangeDate={handleChangeDate}
          onAddEvent={onAddEvent}
        />
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          headerToolbar={false}
          initialDate={date}
          initialView={initialView}
          events={fullCalendarEvents}
          eventClick={(clickInfo) => {
            const info = clickEvent(clickInfo);
            onClickEvent?.(info);
          }}
          height="90vh"
        />
      </div>
    );
  },
);

export default Calendar;
