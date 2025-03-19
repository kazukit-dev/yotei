import type { CalendarId } from "../../../event/objects/id";
import type { Name } from "../name";

export type UnvalidatedCalendar = {
  kind: "unvalidated";
  name: string;
};

export type ValidatedCalendar = {
  kind: "validated";
  name: Name;
};

export type CreatedCalendar = {
  kind: "created";
  id: CalendarId;
  name: Name;
};
