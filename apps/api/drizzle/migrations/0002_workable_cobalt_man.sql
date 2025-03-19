ALTER TABLE "event_exceptions" ADD COLUMN "type" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_rrule" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_rrule" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "modified_start";--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "modified_end";--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "modified_title";--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "modified_is_all_day";--> statement-breakpoint
ALTER TABLE "event_exceptions" DROP COLUMN "is_cancelled";