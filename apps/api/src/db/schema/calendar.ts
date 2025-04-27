import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const calendars = pgTable("calendars", {
  id: uuid().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  owner_id: uuid().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
