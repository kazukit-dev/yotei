import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import type { EventDetail } from "~/models/event";
import { eventKey } from "./cache";
import { fetchEventById } from "./function";
import { toEventDetailDomain } from "./transform";

type CustomQueryConfig = Omit<UseQueryOptions, "queryKey" | "queryFn">;

const getEventById = async (
  calendarId: string,
  eventId: string,
  targetDate?: string,
) => {
  const result = await fetchEventById(calendarId, eventId, targetDate);
  if (result.ok) return toEventDetailDomain(result.data);
  throw new Error(`Failed to fetch event ${eventId}`, { cause: result.error });
};

export const useEventDetailQuery = ({
  targetDate,
  calendarId,
  eventId,
  ...config
}: CustomQueryConfig & {
  calendarId: string;
  eventId?: string;
  targetDate?: Date;
}) => {
  const target = targetDate?.toISOString();
  const query = useQuery({
    queryKey: eventId ? eventKey.detail(calendarId, eventId, target) : [null],
    queryFn: () => (eventId ? getEventById(calendarId, eventId, target) : null),
    ...config,
  }) as UseQueryResult<EventDetail, Error>;
  return query;
};
