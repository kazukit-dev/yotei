import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { accounts, sessions } from "./auth";

export const users = pgTable("users", {
  id: uuid().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userRelation = relations(users, ({ one, many }) => ({
  email: one(userEmail),
  account: one(accounts),
  session: many(sessions),
}));

export const userEmail = pgTable("user_email", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  user_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
