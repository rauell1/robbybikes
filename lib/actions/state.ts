import type { ActionState, BikeFormState } from "@/lib/actions/admin-bike-actions";
import type { EnquiryUpdateState } from "@/lib/actions/admin-enquiry-actions";
import type { EnquiryFormState } from "@/lib/actions/enquiry-actions";

/**
 * Initial values for useActionState live outside the "use server" modules:
 * those files may only export async functions.
 */
export const initialEnquiryState: EnquiryFormState = { status: "idle" };
export const initialBikeFormState: BikeFormState = { status: "idle" };
export const initialActionState: ActionState = { status: "idle" };
export const initialEnquiryUpdateState: EnquiryUpdateState = { status: "idle" };
