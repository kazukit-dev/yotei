import { Link, useLoaderData } from "@remix-run/react";

type Calendar = {
  id: string;
  name: string;
};

export const clientLoader = async (): Promise<Calendar[]> => {
  return [];
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
