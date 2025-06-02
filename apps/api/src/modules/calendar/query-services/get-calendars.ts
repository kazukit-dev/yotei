import { eq } from "drizzle-orm";

import { calendars, DB } from "../../../db";
import { DBError } from "../../../shared/errors";
import { Calendar } from "../objects/read/calendar";

export const getCalendars =
  (db: DB) =>
  async (userId: string): Promise<Calendar[]> => {
    try {
      const data = await db
        .select({
          id: calendars.id,
          name: calendars.name,
          owner_id: calendars.owner_id,
        })
        .from(calendars)
        .where(eq(calendars.owner_id, userId));

      return data;
    } catch (error: unknown) {
      throw new DBError("Failed to get calendars", { cause: error });
    }
  };
