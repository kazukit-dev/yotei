import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import dayjs from "dayjs";
import { z } from "zod";
import { getEvents } from "~/api/events";

export const _clientLoader = async ({
  params,
  request,
}: ClientLoaderFunctionArgs) => {
  console.log("**************** loader start??");
  const calendarId = calendarIdSchema.parse(params.calendarId);

  const viewType = params.view
    ? viewTypeSchema.parse(params.view)
    : (getDefaultViewType() ?? "month");

  const url = new URL(request.url);
  const unvalidatedFocusDate = url.searchParams.get("focus_date");
  const focusDate =
    unvalidatedFocusDate && dayjs(unvalidatedFocusDate).isValid()
      ? new Date(unvalidatedFocusDate)
      : new Date();

  const { from, to } = getDateRange(focusDate, viewType);

  const events = await getEvents(calendarId, from, to.toString());

  return {
    events,
    calendarId,
    viewType,
    focusDate,
  };
};

const getDateRange = (
  focusDate: Date,
  viewType: "week" | "month" = "month",
) => {
  switch (viewType) {
    case "month": {
      const from = dayjs(focusDate)
        .startOf("M")
        .startOf("week")
        .format("YYYY-MM-DD");
      const to = dayjs(focusDate).endOf("M").endOf("week").format("YYYY-MM-DD");
      return { from, to };
    }
    case "week": {
      const from = dayjs(focusDate).startOf("week").format("YYYY-MM-DD");
      const to = dayjs(focusDate).endOf("week").format("YYYY-MM-DD");
      return { from, to };
    }
  }
};

const calendarIdSchema = z.string().min(1);
const viewTypeSchema = z.enum(["week", "month"]);

export const getDefaultViewType = () => {
  const value = localStorage.getItem("default-cal-mode");
  const parsed = viewTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};
