import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const motorcycleStatusEnum = pgEnum("motorcycle_status", [
  "available",
  "reserved",
  "pending_sale",
  "sold",
]);

export const motorcycleConditionEnum = pgEnum("motorcycle_condition", [
  "excellent",
  "very_good",
  "good",
  "fair",
  "needs_repair",
]);

export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "in_progress",
  "closed",
]);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "staff"]);

export type MotorcycleStatus = (typeof motorcycleStatusEnum.enumValues)[number];
export type MotorcycleCondition = (typeof motorcycleConditionEnum.enumValues)[number];
export type EnquiryStatus = (typeof enquiryStatusEnum.enumValues)[number];
export type AdminRole = (typeof adminRoleEnum.enumValues)[number];

export const motorcycles = pgTable(
  "motorcycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    year: integer("year"),
    engineCc: integer("engine_cc"),
    /** Asking price in whole Kenyan Shillings. Never store formatted strings. */
    priceKes: integer("price_kes").notNull(),
    condition: motorcycleConditionEnum("condition").notNull().default("good"),
    odometerKm: integer("odometer_km"),
    transmission: text("transmission"),
    fuelType: text("fuel_type").default("Petrol"),
    colour: text("colour"),
    /** Intended use, e.g. Commuting, Boda boda, Utility. */
    usage: text("usage"),
    /** Registration / paperwork note, e.g. "Logbook available". */
    registration: text("registration"),
    description: text("description").notNull().default(""),
    inspectionNotes: text("inspection_notes"),
    serviceHistory: text("service_history"),
    status: motorcycleStatusEnum("status").notNull().default("available"),
    isPublished: boolean("is_published").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    /** Demonstrates the platform until verified stock is imported. */
    isSample: boolean("is_sample").notNull().default(false),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("motorcycles_slug_key").on(table.slug),
    index("motorcycles_status_idx").on(table.status),
    index("motorcycles_brand_idx").on(table.brand),
    index("motorcycles_model_idx").on(table.model),
    index("motorcycles_price_idx").on(table.priceKes),
    index("motorcycles_year_idx").on(table.year),
    index("motorcycles_created_idx").on(table.createdAt),
    index("motorcycles_published_status_idx").on(table.isPublished, table.status),
    check("motorcycles_price_positive", sql`${table.priceKes} > 0`),
    check(
      "motorcycles_engine_cc_valid",
      sql`${table.engineCc} is null or (${table.engineCc} > 0 and ${table.engineCc} <= 2000)`,
    ),
    check(
      "motorcycles_year_valid",
      sql`${table.year} is null or (${table.year} >= 1950 and ${table.year} <= 2100)`,
    ),
    check(
      "motorcycles_odometer_valid",
      sql`${table.odometerKm} is null or ${table.odometerKm} >= 0`,
    ),
  ],
);

export const motorcycleImages = pgTable(
  "motorcycle_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    motorcycleId: uuid("motorcycle_id")
      .notNull()
      .references(() => motorcycles.id, { onDelete: "cascade" }),
    /** Object storage key when uploaded through the admin, otherwise null. */
    storageKey: text("storage_key"),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("motorcycle_images_motorcycle_idx").on(table.motorcycleId, table.sortOrder),
  ],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerName: text("customer_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text("email"),
    motorcycleId: uuid("motorcycle_id").references(() => motorcycles.id, {
      onDelete: "set null",
    }),
    preferredContactMethod: text("preferred_contact_method").notNull().default("phone"),
    message: text("message").notNull(),
    status: enquiryStatusEnum("status").notNull().default("new"),
    /** Where the enquiry came from: contact page, listing page, etc. */
    source: text("source").notNull().default("website"),
    internalNotes: text("internal_notes"),
    consentRecordedAt: timestamp("consent_recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("enquiries_status_idx").on(table.status),
    index("enquiries_created_idx").on(table.createdAt),
    index("enquiries_motorcycle_idx").on(table.motorcycleId),
  ],
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    role: adminRoleEnum("role").notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_key").on(table.email)],
);

export const motorcyclesRelations = relations(motorcycles, ({ many }) => ({
  images: many(motorcycleImages),
  enquiries: many(enquiries),
}));

export const motorcycleImagesRelations = relations(motorcycleImages, ({ one }) => ({
  motorcycle: one(motorcycles, {
    fields: [motorcycleImages.motorcycleId],
    references: [motorcycles.id],
  }),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  motorcycle: one(motorcycles, {
    fields: [enquiries.motorcycleId],
    references: [motorcycles.id],
  }),
}));

export type Motorcycle = typeof motorcycles.$inferSelect;
export type NewMotorcycle = typeof motorcycles.$inferInsert;
export type MotorcycleImage = typeof motorcycleImages.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type MotorcycleWithImages = Motorcycle & { images: MotorcycleImage[] };
export type EnquiryWithMotorcycle = Enquiry & {
  motorcycle: Pick<Motorcycle, "id" | "slug" | "brand" | "model" | "priceKes"> | null;
};
