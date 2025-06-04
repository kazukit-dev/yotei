import { PlusIcon } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { getCalendars } from "~/api/calendar";

export const clientLoader = async () => {
  const calendars = await getCalendars();

  return { ok: true, calendars };
};

export default function Calendars() {
  const { calendars } = useLoaderData<typeof clientLoader>();
  if (!calendars) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-3xl text-gray-500">No calendars available</p>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="w-1/3">
        <div className="pt-10">
          <h1 className="text-3xl font-bold">Calendars</h1>
        </div>
        <div className="grid grid-cols-3 justify-center gap-4 pt-8">
          {calendars.map((calendar) => {
            return (
              <Link
                className="rounded-lg border border-gray-300 hover:bg-gray-100"
                to={`/calendars/${calendar.id}`}
                key={calendar.id}
              >
                <div className="flex h-32 w-full items-center">
                  <span className="pl-5 text-lg font-semibold text-gray-800">
                    {calendar.name}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            to="/calendars/new"
            className="flex h-32 items-center rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            <div className="flex items-center gap-3 pl-5">
              <PlusIcon size={25} />
              <span className="text-lg font-semibold text-gray-800">
                Create new calendar
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
