import { useState } from "react";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";

import _Calendar, { type ViewType } from "~/components/calendar";
import { EventCreateDialog } from "~/components/dialog/event-create-dialog";
import { EventDetailDialog } from "~/components/dialog/event-detail-dialog";
import { PatternSelectDialog } from "~/components/dialog/pattern-select-dialog";
import type { Event, EventDetail } from "~/models/event";
import { format } from "~/utils/day";

import { _clientAction } from "./action";
import { _clientLoader } from "./loader";

export const clientLoader = _clientLoader;

export const saveDefaultCalMode = (value: ViewType) => {
  localStorage.setItem("default-cal-mode", value);
};

export default function Calendar() {
  const { events, calendarId, viewType, focusDate } =
    useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [isNewOpen, setIsNewOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);

  const handleChangeView = (view: ViewType) => {
    saveDefaultCalMode(view);
    navigate({
      pathname: `/calendars/${calendarId}/${view}`,
      search: `?focus_date=${format(focusDate, "YYYY-MM-DD")}`,
    });
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleChangeDate = (date: Date) => {
    const focusDate = format(date, "YYYY-MM-DD");
    navigate({
      pathname: `/calendars/${calendarId}/${viewType}`,
      search: `?focus_date=${focusDate}`,
    });
  };

  const handleEdit = (id: string, targetDate: Date) => {
    navigate(
      {
        pathname: `/calendars/${calendarId}/events/${id}/edit`,
        search: `?target_date=${targetDate.toISOString()}`,
      },
      { state: { focus_date: targetDate.toISOString() } },
    );
  };
  const handleAddEvent = () => {
    setIsNewOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const pattern = selectedEvent.is_recurring
      ? await PatternSelectDialog.call({
          title: "Delete Recurring Event",
        })
      : 0;
    if (pattern === null) return;
    submit(
      {
        intent: "delete",
        target_date: selectedEvent.start.toISOString(),
        eventId: selectedEvent.id,
        pattern,
      },
      { method: "DELETE", encType: "application/json" },
    );
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="p-5">
        <_Calendar
          events={events}
          date={focusDate}
          view={viewType}
          isLoading={navigation.state === "loading"}
          onClickEvent={({ event }) => {
            handleEventSelect(event);
          }}
          onChangeDate={handleChangeDate}
          onChangeView={handleChangeView}
          onAddEvent={handleAddEvent}
        />
      </div>

      <EventCreateDialog
        isOpen={isNewOpen}
        onOpenChange={(isOpen) => {
          setIsNewOpen(isOpen);
        }}
        onSubmit={(data) => {
          submit(
            { ...data, intent: "add" },
            { method: "POST", encType: "application/json" },
          );
          setIsNewOpen(false);
        }}
      />

      {selectedEvent ? (
        <EventDetailDialog
          isOpen={true}
          event={selectedEvent}
          onOpenChange={() => {
            setSelectedEvent(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : null}

      <PatternSelectDialog.Root />
    </>
  );
}

export const clientAction = _clientAction;
