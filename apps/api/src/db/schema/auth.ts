import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./user";

export const sessions = pgTable("sessions", {
  id: uuid().primaryKey(),
  user_id: uuid().notNull(),
  expires_at: timestamp().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

export const sessionsRelation = relations(sessions, ({ one }) => {
  return {
    user: one(users, {
      fields: [sessions.user_id],
      references: [users.id],
    }),
  };
});

export const accounts = pgTable("accounts", {
  id: uuid().primaryKey().defaultRandom(),
  account_id: varchar({ length: 256 }).notNull().unique(),
  provider_id: varchar({ length: 64 }).notNull(),
  user_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp().defaultNow().notNull(),
});
