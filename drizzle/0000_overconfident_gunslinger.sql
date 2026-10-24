CREATE TYPE "public"."admin_role" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."motorcycle_condition" AS ENUM('excellent', 'very_good', 'good', 'fair', 'needs_repair');--> statement-breakpoint
CREATE TYPE "public"."motorcycle_status" AS ENUM('available', 'reserved', 'pending_sale', 'sold');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"motorcycle_id" uuid,
	"preferred_contact_method" text DEFAULT 'phone' NOT NULL,
	"message" text NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"internal_notes" text,
	"consent_recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motorcycle_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"motorcycle_id" uuid NOT NULL,
	"storage_key" text,
	"image_url" text NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motorcycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"engine_cc" integer,
	"price_kes" integer NOT NULL,
	"condition" "motorcycle_condition" DEFAULT 'good' NOT NULL,
	"odometer_km" integer,
	"transmission" text,
	"fuel_type" text DEFAULT 'Petrol',
	"colour" text,
	"usage" text,
	"registration" text,
	"description" text DEFAULT '' NOT NULL,
	"inspection_notes" text,
	"service_history" text,
	"status" "motorcycle_status" DEFAULT 'available' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "motorcycles_price_positive" CHECK ("motorcycles"."price_kes" > 0),
	CONSTRAINT "motorcycles_engine_cc_valid" CHECK ("motorcycles"."engine_cc" is null or ("motorcycles"."engine_cc" > 0 and "motorcycles"."engine_cc" <= 2000)),
	CONSTRAINT "motorcycles_year_valid" CHECK ("motorcycles"."year" is null or ("motorcycles"."year" >= 1950 and "motorcycles"."year" <= 2100)),
	CONSTRAINT "motorcycles_odometer_valid" CHECK ("motorcycles"."odometer_km" is null or "motorcycles"."odometer_km" >= 0)
);
--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycle_images" ADD CONSTRAINT "motorcycle_images_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "enquiries_motorcycle_idx" ON "enquiries" USING btree ("motorcycle_id");--> statement-breakpoint
CREATE INDEX "motorcycle_images_motorcycle_idx" ON "motorcycle_images" USING btree ("motorcycle_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "motorcycles_slug_key" ON "motorcycles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "motorcycles_status_idx" ON "motorcycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "motorcycles_brand_idx" ON "motorcycles" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "motorcycles_model_idx" ON "motorcycles" USING btree ("model");--> statement-breakpoint
CREATE INDEX "motorcycles_price_idx" ON "motorcycles" USING btree ("price_kes");--> statement-breakpoint
CREATE INDEX "motorcycles_year_idx" ON "motorcycles" USING btree ("year");--> statement-breakpoint
CREATE INDEX "motorcycles_created_idx" ON "motorcycles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "motorcycles_published_status_idx" ON "motorcycles" USING btree ("is_published","status");