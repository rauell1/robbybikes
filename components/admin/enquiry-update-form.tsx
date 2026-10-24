"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  updateEnquiryAction,
  type EnquiryUpdateState,
} from "@/lib/actions/admin-enquiry-actions";
import { initialEnquiryUpdateState } from "@/lib/actions/state";
import { ENQUIRY_STATUS_LABELS } from "@/lib/format";
import type { EnquiryStatus } from "@/lib/db/schema";

const STATUSES: EnquiryStatus[] = ["new", "contacted", "in_progress", "closed"];

export function EnquiryUpdateForm({
  enquiryId,
  status,
  internalNotes,
}: {
  enquiryId: string;
  status: EnquiryStatus;
  internalNotes: string | null;
}) {
  const [state, formAction, pending] = useActionState<EnquiryUpdateState, FormData>(
    updateEnquiryAction,
    initialEnquiryUpdateState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={enquiryId} />

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {state.message}
        </p>
      ) : null}

      <Field label="Status" htmlFor="enquiry-status">
        <Select id="enquiry-status" name="status" defaultValue={status}>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {ENQUIRY_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Internal follow-up notes"
        htmlFor="enquiry-notes"
        hint="Only administrators can see these notes."
      >
        <Textarea
          id="enquiry-notes"
          name="internalNotes"
          rows={5}
          maxLength={2000}
          defaultValue={internalNotes ?? ""}
          placeholder="Called on 24 Oct — viewing booked for Saturday 10am."
        />
      </Field>

      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        Save enquiry
      </Button>
    </form>
  );
}
