import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import type { Event } from "~/models/event";
import { format } from "~/utils/day";

type LoaderResult =
  | {
      ok: true;
      data: Event[];
    }
  | { ok: false; error: unknown };

type Loader = (...args: unknown[]) => Promise<LoaderResult>;

type UseEventFetcherProps = {
  initialEvents: Event[] | undefined;
};

export function useEventFetcher<L extends Loader>(
  props?: UseEventFetcherProps,
) {
  const [events, setEvents] = useState<Event[]>(props?.initialEvents ?? []);
  const fetcher = useFetcher<L>();

  useEffect(() => {
    if (!fetcher.data || fetcher.state === "loading") {
      return;
    }
    if (fetcher.data?.ok) {
      setEvents(fetcher.data.data as Event[]);
    }
  }, [fetcher]);

  const fetchEvents = (cursorDate: Date) => {
    fetcher.submit(
      { cursor: format(cursorDate, "YYYY-MM-DD") },
      { method: "GET" },
    );
  };

  return {
    fetchEvents,
    events,
  };
}
