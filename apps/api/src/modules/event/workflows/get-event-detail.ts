import dayjs from "dayjs";
import { err, ok, type Result } from "neverthrow";

import type { ValidationError } from "../../../shared/errors";
import { getRecurringDates } from "../objects/read/rrule";

class NotFoundRecurringEvent extends Error {}

export interface EventDetail {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: number;
  is_all_day: boolean;
  is_recurring: boolean;
  exceptions?: { type: string; target_date: string }[] | null;
  rrule?: {
    freq: number;
    until: string;
    dtstart: string;
  } | null;
}

type UnfoundCommand = {
  kind: "unfound";
  event: EventDetail;
  input: {
    target_date: string;
  };
};

type FoundCommand = EventDetail & { kind: "found" };

type FindEvent = (
  command: UnfoundCommand,
) => Result<FoundCommand, NotFoundRecurringEvent>;

type Workflow = (
  command: UnfoundCommand,
) => Result<FoundCommand, ValidationError | NotFoundRecurringEvent>;

const findEvent: FindEvent = ({ event, input: { target_date } }) => {
  // Single event
  if (!event.is_recurring) {
    return ok({ ...event, kind: "found" });
  }

  // Recurring event -- get target date
  const from = dayjs(target_date).startOf("D").toDate();
  const to = dayjs(target_date).endOf("D").toDate();

  if (!event.rrule) {
    return err(new NotFoundRecurringEvent("Not found rrule."));
  }

  const rrule = {
    ...event.rrule,
    dtstart: new Date(event.rrule.dtstart),
    until: new Date(event.rrule.until),
  };
  const getDates = getRecurringDates(rrule);
  const dates = getDates({ from, to });

  if (dates.length === 0) {
    return err(
      new NotFoundRecurringEvent(
        `Target date ${target_date} for recurrence not found.`,
      ),
    );
  }

  const start = dates[0];
  const end = dayjs(start).add(event.duration).toDate();
  return ok({
    ...event,
    start: dates[0].toISOString(),
    end: end.toISOString(),
    kind: "found",
  });
};

export const getEventDetailWorkflow = (): Workflow => (command) => {
  return ok(command).andThen(findEvent);
};
