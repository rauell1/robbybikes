"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { enquiries, motorcycles } from "@/lib/db/schema";
import { enquiryFormSchema } from "@/lib/validation";
import { normalisePhone } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export type EnquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  submittedName?: string;
};


function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value.length > 0) result[key] = value;
  }
  return result;
}

const SILENT_SUCCESS: EnquiryFormState = {
  status: "success",
  message: "Thank you — your enquiry has been received.",
};

/**
 * Stores a customer enquiry. Protections: honeypot field, a minimum time on
 * form, per-IP and per-phone rate limits, and strict server-side validation.
 */
export async function submitEnquiry(
  _previous: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  // Honeypot: real browsers never fill this hidden field. Drop silently.
  if (readField(formData, "website").length > 0) return SILENT_SUCCESS;

  const startedAt = Number(readField(formData, "startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 1500) {
    return SILENT_SUCCESS;
  }

  const ip = await getClientIp();
  // Shared mobile networks (CGNAT) can front several customers, so this limit
  // is generous while still stopping scripted abuse.
  const ipLimit = rateLimit(`enquiry:ip:${ip}`, { max: 8, windowMs: 10 * 60_000 });
  if (!ipLimit.ok) {
    return {
      status: "error",
      message:
        "You have sent several enquiries already. Please call or WhatsApp us on 0768 462 250 and we will help right away.",
    };
  }

  const parsed = enquiryFormSchema.safeParse({
    name: readField(formData, "name"),
    phone: readField(formData, "phone"),
    email: readField(formData, "email"),
    preferredContact: readField(formData, "preferredContact") || "phone",
    message: readField(formData, "message"),
    motorcycleId: readField(formData, "motorcycleId"),
    consent: readField(formData, "consent"),
    source: readField(formData, "source") || "website",
    website: readField(formData, "website"),
    startedAt: readField(formData, "startedAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;
  const phone = normalisePhone(data.phone);
  if (!phone) {
    return {
      status: "error",
      message: "Please check your phone number.",
      fieldErrors: { phone: ["Enter a valid Kenyan mobile number"] },
    };
  }

  const phoneLimit = rateLimit(`enquiry:phone:${phone}`, { max: 3, windowMs: 60 * 60_000 });
  if (!phoneLimit.ok) {
    return {
      status: "error",
      message: "We have already received your enquiry. Our team will be in touch shortly.",
    };
  }

  const source = data.source?.startsWith("listing:") ? data.source.slice(0, 60) : "website";

  try {
    const db = await getDb();

    let motorcycleId: string | null = null;
    if (data.motorcycleId) {
      const [bike] = await db
        .select({ id: motorcycles.id })
        .from(motorcycles)
        .where(and(eq(motorcycles.id, data.motorcycleId), eq(motorcycles.isPublished, true)))
        .limit(1);
      motorcycleId = bike?.id ?? null;
    }

    await db.insert(enquiries).values({
      customerName: data.name,
      phoneNumber: phone,
      email: data.email ?? null,
      motorcycleId,
      preferredContactMethod: data.preferredContact,
      message: data.message,
      source: motorcycleId ? source : "contact",
      consentRecordedAt: new Date(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");

    return {
      status: "success",
      message: `Thank you, ${data.name.split(" ")[0]}. Your enquiry has reached the Robbybikes team. We will get back to you on ${data.preferredContact === "whatsapp" ? "WhatsApp" : data.preferredContact === "email" ? "email" : "the phone"} during business hours.`,
      submittedName: data.name,
    };
  } catch {
    return {
      status: "error",
      message:
        "We could not save your enquiry just now. Please try again, or call us on 0768 462 250.",
      fieldErrors: {},
    };
  }
}
