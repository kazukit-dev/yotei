import {
  ClientActionFunctionArgs,
  redirect,
  useSubmit,
} from "@remix-run/react";

import { createNewCalendar } from "~/api/calendar";

import { CalendarCreateForm } from "./components/form";

export default function NewCalendar() {
  const submit = useSubmit();

  return (
    <div className="flex justify-center pt-10">
      <div className="w-1/4">
        <h1 className="pb-5 text-2xl font-bold">New Calendar</h1>

        <CalendarCreateForm
          onSubmit={(data) => {
            submit(data, { method: "POST", encType: "application/json" });
          }}
        />
      </div>
    </div>
  );
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const data = await request.json();
  await createNewCalendar(data);
  return redirect("/calendars");
};
