import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userRelation = relations(users, ({ one }) => ({
  password: one(userPassword),
  email: one(userEmail),
  token: one(userToken),
}));

export const userPassword = pgTable("user_hashed_password", {
  id: uuid().primaryKey().defaultRandom(),
  hashed_password: text().notNull(),
  user_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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

export const userToken = pgTable("user_token", {
  id: uuid().primaryKey().defaultRandom(),
  token: text().notNull(),
  user_id: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires_at: timestamp().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});
