CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"action" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"actor" text NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
