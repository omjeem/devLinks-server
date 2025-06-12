CREATE TABLE IF NOT EXISTS "links" (
	"id" varchar,
	"userId" varchar,
	"field" varchar NOT NULL,
	"value" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "links_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar,
	"userName" varchar,
	"email" varchar,
	"password" varchar,
	"name" varchar,
	"signMethod" varchar,
	"isVerified" boolean,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_userName_unique" UNIQUE("userName"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "links" ADD CONSTRAINT "links_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
