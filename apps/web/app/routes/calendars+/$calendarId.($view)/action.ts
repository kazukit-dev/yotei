import dayjs from "dayjs";
import type { ClientActionFunctionArgs } from "react-router";
import { z } from "zod";

import { createNewEvent, deleteEvent } from "~/api/events";
import type { EventCreateSchema } from "~/components/event-forms/schema2/create";
import { FREQUENCY } from "~/models/event";

const ParamsSchema = z.object({
  calendarId: z.string().min(1),
});

export const _clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  const { calendarId } = ParamsSchema.parse(params);
  const data = await request.json();

  switch (data.intent) {
    case "add": {
      await createNewEvent(calendarId, toEventCreateData(data));
      break;
    }
    case "delete": {
      await deleteEvent(calendarId, data.eventId, {
        pattern: data.pattern,
        target_date: data.target_date,
      });
    }
    default:
      break;
  }
  return { ok: true };
};

const toEventCreateData = (data: EventCreateSchema) => {
  const start = data.is_all_day
    ? data.start.date
    : toDateTimeString(data.start.date, data.start.time);
  const end = data.is_all_day
    ? data.end.date
    : toDateTimeString(data.end.date, data.end.time);

  if (data.rrule.freq === "none") {
    return {
      title: data.title,
      start,
      end,
      is_all_day: data.is_all_day,
      is_recurring: false,
    } as const;
  }
  return {
    title: data.title,
    start,
    end,
    is_recurring: true,
    is_all_day: data.is_all_day,
    rrule: {
      freq: FREQUENCY[data.rrule.freq],
      until: dayjs(data.rrule.until).endOf("D").toISOString(),
    },
  } as const;
};

const toDateTimeString = (date: string, time?: string) => {
  const str = time ? `${date}T${time}` : date;
  return new Date(str).toISOString();
};
