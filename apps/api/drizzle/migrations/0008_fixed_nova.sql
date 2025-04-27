ALTER TABLE "events" DROP CONSTRAINT "events_calendar_id_calendars_id_fk";
--> statement-breakpoint
ALTER TABLE "calendars" ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "calendars" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "calendars" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;