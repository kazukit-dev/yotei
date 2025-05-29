ALTER TABLE "auth0_login" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "sub" TO "account_id";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "auth0_login_sub_unique";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "auth0_login_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "provider_id" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_account_id_unique" UNIQUE("account_id");