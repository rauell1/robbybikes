"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { enquiryStatusSchema } from "@/lib/validation";

export type EnquiryUpdateState = {
  status: "idle" | "success" | "error";
  message?: string;
};


function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateEnquiryAction(
  _previous: EnquiryUpdateState,
  formData: FormData,
): Promise<EnquiryUpdateState> {
  await requireAdmin("/admin/enquiries");

  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Unknown enquiry." };
  }

  const parsedStatus = enquiryStatusSchema.safeParse(readField(formData, "status"));
  if (!parsedStatus.success) {
    return { status: "error", message: "Choose a valid enquiry status." };
  }

  const internalNotes = readField(formData, "internalNotes").slice(0, 2000);

  try {
    const db = await getDb();
    await db
      .update(enquiries)
      .set({
        status: parsedStatus.data,
        internalNotes: internalNotes.length > 0 ? internalNotes : null,
        updatedAt: new Date(),
      })
      .where(eq(enquiries.id, id));

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${id}`);

    return { status: "success", message: "Enquiry updated." };
  } catch {
    return { status: "error", message: "The enquiry could not be updated. Please try again." };
  }
}

export async function setEnquiryStatusAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/enquiries");

  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const parsedStatus = enquiryStatusSchema.safeParse(readField(formData, "status"));
  if (!parsedStatus.success) return;

  const db = await getDb();
  await db
    .update(enquiries)
    .set({ status: parsedStatus.data, updatedAt: new Date() })
    .where(eq(enquiries.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
}

export async function deleteEnquiryAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/enquiries");

  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const db = await getDb();
  await db.delete(enquiries).where(eq(enquiries.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries?deleted=1");
}
