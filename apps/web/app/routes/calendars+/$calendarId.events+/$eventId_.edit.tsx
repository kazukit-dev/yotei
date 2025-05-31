import {
  Await,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import {} from "lucide-react";
import { Suspense, useEffect } from "react";

import { getEventDetail, updateEvent } from "~/api/events";
import type { UpdateEventInput } from "~/api/events/type";
import { PatternSelectDialog } from "~/components/dialog/pattern-select-dialog";
import { EventEditForm } from "~/components/event-forms/presentations/event-edit-form";
import { Button } from "~/components/ui/button";
import { type EventDetail, OPERATION_PATTERN } from "~/models/event";
import { format } from "~/utils/day";

export const clientLoader = async ({
  request,
  params,
}: ClientLoaderFunctionArgs) => {
  const { calendarId, eventId } = params;
  const url = new URL(request.url);
  const targetDate = url.searchParams.get("target_date");

  const promise = getEventDetail(
    calendarId as string,
    eventId as string,
    targetDate ?? undefined,
  );

  return { promise, targetDate, calendarId };
};

const toFormData = (event: EventDetail) => {
  return {
    title: event.title,
    start: {
      date: format(event.start, "YYYY-MM-DD"),
      time: format(event.start, "HH:mm"),
    },
    end: {
      date: format(event.end, "YYYY-MM-DD"),
      time: format(event.end, "HH:mm"),
    },
    is_all_day: event.is_all_day,
  };
};

export default function EventEditView() {
  const { promise, targetDate, calendarId } =
    useLoaderData<typeof clientLoader>();
  const fetcher = useFetcher<typeof clientAction>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (fetcher?.data?.ok) {
      navigate({
        pathname: `/calendars/${calendarId}`,
        search: `?target_date=${targetDate}`,
      });
    }
  }, [fetcher, calendarId, targetDate, navigate]);

  const editEvent = (data: UpdateEventInput) => {
    fetcher.submit(data, {
      method: "POST",
      encType: "application/json",
    });
  };
  const handleSubmit =
    (event: EventDetail) =>
    async (input: {
      start: string;
      end: string;
      title: string;
      is_all_day: boolean;
    }) => {
      const pattern = event.is_recurring
        ? await PatternSelectDialog.call({ title: "Edit Recurring Event" })
        : OPERATION_PATTERN.this;
      if (pattern === null) return;
      editEvent({
        pattern,
        target_date: event.start.toISOString(),
        ...input,
      });
    };

  const goBack = () => {
    const targetDate = location.state?.target_date;
    navigate({
      pathname: `/calendars/${calendarId}`,
      search: targetDate ? `?target_date=${targetDate}` : undefined,
    });
  };

  return (
    <div className="flex justify-center">
      <div className="flex w-1/3 flex-col gap-7 pt-10">
        <h1 className="text-4xl font-bold">Edit event</h1>
        <Suspense fallback={<EventEditSkeleton />}>
          <Await resolve={promise}>
            {(event) => (
              <>
                <EventEditForm
                  id="event-edit-form"
                  defaultValue={toFormData(event)}
                  onSubmit={handleSubmit(event)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    onPress={() => goBack()}
                    className="w-36"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    form="event-edit-form"
                    className="w-36"
                    variant="default"
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </Await>
        </Suspense>
      </div>
      <PatternSelectDialog.Root />
    </div>
  );
}

export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  const { calendarId, eventId } = params;
  try {
    const data = await request.json();
    await updateEvent(calendarId as string, eventId as string, data);
    return { ok: true };
  } catch (_: unknown) {
    return { ok: false };
  }
};

const EventEditSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-9 rounded bg-gray-300" />
      <div className="h-7 rounded bg-gray-300" />
      <div className="h-7 rounded bg-gray-300" />
      <div className="h-7 rounded bg-gray-300" />
      <div className="h-7 rounded bg-gray-300" />
      <div className="h-7 rounded bg-gray-300" />
    </div>
  );
};
