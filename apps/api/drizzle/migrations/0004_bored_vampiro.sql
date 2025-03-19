ALTER TABLE "event_exceptions" ALTER COLUMN "target_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_rrule" ALTER COLUMN "until" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_rrule" ALTER COLUMN "dtstart" SET DATA TYPE timestamp with time zone;