import { Link, useLoaderData } from "@remix-run/react";
import { API_URL } from "~/config";
import { queryClient } from "~/libs/query-client";

type Calendar = {
  id: string;
  name: string;
};

const getCalendars = async (): Promise<Calendar[]> => {
  const data = await fetch(new URL("/calendars", API_URL));
  return data.json();
};

export const clientLoader = async (): Promise<Calendar[]> => {
  const data = await queryClient.ensureQueryData({
    queryKey: ["calendars"],
    queryFn: getCalendars,
    staleTime: 10000,
  });
  return data;
};

export default function Calendars() {
  const calendars = useLoaderData<typeof clientLoader>();

  if (!calendars) {
    return <div>Error</div>;
  }

  return (
    <div>
      <h1>Calendar</h1>
      <div>
        {calendars.map((calendar) => {
          return (
            <Link to={`${calendar.id}/events`} key={calendar.id}>
              <div>{calendar.name}</div>
            </Link>
          );
        })}
      </div>

      <div>
        <Link to={"new"}>Add Calendar</Link>
      </div>
    </div>
  );
}
