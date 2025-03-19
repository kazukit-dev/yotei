ALTER TABLE "event_exceptions" ALTER COLUMN "modified_start" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" ALTER COLUMN "modified_end" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" ALTER COLUMN "modified_title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" ALTER COLUMN "modified_is_all_day" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" ADD COLUMN "is_cancelled" boolean NOT NULL;