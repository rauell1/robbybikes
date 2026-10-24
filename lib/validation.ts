import { z } from "zod";
import { CONDITION_OPTIONS, SORT_OPTIONS, TRANSMISSION_OPTIONS, USAGE_OPTIONS } from "@/lib/filters";
import { normalisePhone, slugify } from "@/lib/utils";
import { motorcycleStatusEnum } from "@/lib/db/schema";

const trimmed = (max: number) => z.string().trim().max(max, `Please use ${max} characters or fewer`);

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a phone number")
  .max(24, "That phone number is too long")
  .refine((value) => normalisePhone(value) !== null, {
    message: "Enter a valid Kenyan mobile number, e.g. 0712 345 678",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

export const enquiryFormSchema = z.object({
  name: trimmed(80).pipe(z.string().min(2, "Enter your name")),
  phone: phoneSchema,
  email: z
    .union([z.literal(""), z.email("Enter a valid email address")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  preferredContact: z.enum(["phone", "whatsapp", "sms", "email"]).default("phone"),
  message: trimmed(1500).pipe(z.string().min(5, "Tell us a little about what you need")),
  motorcycleId: z
    .string()
    .trim()
    .uuid("Unknown motorcycle")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  consent: z
    .preprocess(
      (value) => value === "on" || value === "true" || value === true,
      z.boolean(),
    )
    .refine((value) => value, {
      message: "Please agree to be contacted about this enquiry",
    }),
  source: trimmed(60).optional(),
  /** Honeypot field: must stay empty. */
  website: z.string().max(0, "Submission rejected").optional(),
  /** Milliseconds timestamp of when the form was rendered. */
  startedAt: z.string().optional(),
});

export type EnquiryFormInput = z.infer<typeof enquiryFormSchema>;

export const ENQUIRY_STATUS_VALUES = ["new", "contacted", "in_progress", "closed"] as const;

export const enquiryStatusSchema = z.enum(ENQUIRY_STATUS_VALUES);

export const enquiryUpdateSchema = z.object({
  status: enquiryStatusSchema,
  internalNotes: z.string().trim().max(2000).optional(),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Enter your password").max(200),
});

export const MOTORCYCLE_CONDITION_VALUES = CONDITION_OPTIONS.map((option) => option.value);
export const MOTORCYCLE_STATUS_VALUES = motorcycleStatusEnum.enumValues;

const optionalInt = (min: number, max: number, label: string) =>
  z
    .union([z.literal(""), z.string().regex(/^\d+$/, `${label} must be a whole number`)])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : Number(value)))
    .refine((value) => value === undefined || (value >= min && value <= max), {
      message: `${label} must be between ${min} and ${max}`,
    });

const optionalChoice = (options: readonly string[]) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || options.includes(value), {
      message: "Choose one of the listed options",
    });

/** Validates the admin "add / edit motorcycle" form. */
export const motorcycleFormSchema = z.object({
  brand: trimmed(40).pipe(z.string().min(1, "Enter the brand")),
  model: trimmed(60).pipe(z.string().min(1, "Enter the model")),
  slug: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value ? slugify(value) : undefined)),
  year: optionalInt(1950, 2100, "Year"),
  engineCc: optionalInt(1, 2000, "Engine capacity"),
  priceKes: z
    .string()
    .trim()
    .min(1, "Enter the asking price")
    .regex(/^\d{1,9}$/, "Enter the price in whole shillings, e.g. 125000")
    .transform(Number)
    .refine((value) => value > 0, { message: "Enter the asking price" }),
  condition: z.enum(MOTORCYCLE_CONDITION_VALUES as [string, ...string[]]).default("good"),
  odometerKm: optionalInt(0, 1_500_000, "Odometer reading"),
  transmission: optionalChoice(TRANSMISSION_OPTIONS),
  fuelType: optionalText(30),
  colour: optionalText(30),
  usage: optionalChoice(USAGE_OPTIONS),
  registration: optionalText(120),
  description: trimmed(4000).default(""),
  inspectionNotes: optionalText(1000),
  serviceHistory: optionalText(1000),
  status: z.enum(MOTORCYCLE_STATUS_VALUES).default("available"),
  isPublished: z.union([z.literal("on"), z.literal("")]).optional(),
  isFeatured: z.union([z.literal("on"), z.literal("")]).optional(),
  internalNotes: optionalText(2000),
});

export type MotorcycleFormInput = z.infer<typeof motorcycleFormSchema>;

export const imageUploadSchema = z.object({
  altText: z.string().trim().max(160).optional().default(""),
});

export const importRowSchema = z.object({
  brand: z.string().trim().min(1, "brand is required"),
  model: z.string().trim().min(1, "model is required"),
  year: z.string().trim().optional(),
  engine_cc: z.string().trim().optional(),
  price_kes: z.string().trim().regex(/^\d+$/, "price_kes must be a whole number"),
  condition: z.string().trim().optional(),
  odometer_km: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  fuel_type: z.string().trim().optional(),
  colour: z.string().trim().optional(),
  usage: z.string().trim().optional(),
  registration: z.string().trim().optional(),
  description: z.string().trim().optional(),
  inspection_notes: z.string().trim().optional(),
  service_history: z.string().trim().optional(),
  status: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  image_urls: z.string().trim().optional(),
  is_published: z.string().trim().optional(),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);
