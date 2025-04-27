import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid().primaryKey(),
  title: varchar({ length: 256 }).notNull(),
  start: timestamp({ mode: "string", withTimezone: true }).notNull(),
  end: timestamp({ mode: "string", withTimezone: true }).notNull(),
  duration: integer().notNull(),
  is_recurring: boolean().notNull(),
  is_all_day: boolean().notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  calendar_id: uuid().notNull(),
  version: smallint().default(1).notNull(),
});

export const eventRelations = relations(events, ({ many, one }) => ({
  exceptions: many(eventExceptions, { relationName: "exceptions" }),
  rrule: one(recurrenceRule),
}));

export const recurrenceRule = pgTable("event_rrule", {
  id: uuid()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  event_id: uuid()
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  freq: smallint().notNull(),
  until: timestamp({ mode: "string", withTimezone: true }).notNull(),
  dtstart: timestamp({ mode: "string", withTimezone: true }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const recurrenceRuleRelation = relations(recurrenceRule, ({ one }) => ({
  event: one(events, {
    fields: [recurrenceRule.event_id],
    references: [events.id],
  }),
}));

export const eventExceptions = pgTable(
  "event_exceptions",
  {
    event_id: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    target_date: timestamp({ mode: "string", withTimezone: true }).notNull(),
    type: varchar({ length: 64 }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp()
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return [primaryKey({ columns: [table.event_id, table.target_date] })];
  },
);

export const exceptionsRelation = relations(eventExceptions, ({ one }) => ({
  event: one(events, {
    fields: [eventExceptions.event_id],
    references: [events.id],
    relationName: "exceptions",
  }),
}));

export type EventInsertModel = typeof events.$inferInsert;
export type EventExceptionInsertModel = typeof eventExceptions.$inferInsert;
export type RecurrenceRuleInsertModel = typeof recurrenceRule.$inferInsert;

export type EventSelectModel = typeof events.$inferSelect;
export type EventExceptionSelectModel = typeof eventExceptions.$inferSelect;
export type RecurrenceRuleSelectModel = typeof recurrenceRule.$inferSelect;
