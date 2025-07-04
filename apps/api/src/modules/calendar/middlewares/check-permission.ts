import { MiddlewareHandler } from "hono";

import { AuthenticatedEnv } from "../../../env";
import { getCalendarById } from "../repositories/find-calendar-by-id";
import {
  checkCalendarPermissionWorkflow,
  toUnvalidatedCommand,
} from "../workflows/check-calendar-permission";

export const checkCalendarPermission: MiddlewareHandler<
  AuthenticatedEnv
> = async (c, next) => {
  const calendarId = c.req.param("calendarId");
  const userId = c.get("userId");

  if (!calendarId) {
    return c.json({ message: "Calendar ID is required" }, 400);
  }

  const db = c.get("db");
  const command = toUnvalidatedCommand(calendarId);

  const workflow = checkCalendarPermissionWorkflow(userId, getCalendarById(db));

  return await workflow(command).match(
    () => {
      return next();
    },
    (err) => {
      throw err;
    },
  );
};
