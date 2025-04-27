import { CalendarId } from "../../../event/objects/id";
import { CalendarName } from "./name";
import { OwnerId } from "./owner-id";

export type Calendar = {
  id: CalendarId;
  name: CalendarName;
  owner_id: OwnerId;
};
