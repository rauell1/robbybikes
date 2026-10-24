"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  createBikeAction,
  updateBikeAction,
  type BikeFormState,
} from "@/lib/actions/admin-bike-actions";
import { initialBikeFormState } from "@/lib/actions/state";
import { CONDITION_OPTIONS, TRANSMISSION_OPTIONS, USAGE_OPTIONS } from "@/lib/filters";
import { STATUS_LABELS } from "@/lib/format";
import type { Motorcycle, MotorcycleStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const STATUS_ORDER: MotorcycleStatus[] = ["available", "reserved", "pending_sale", "sold"];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 border-b border-mist-200 pb-3">
      <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      {description ? <p className="mt-0.5 text-xs text-mist-500">{description}</p> : null}
    </div>
  );
}

export function BikeForm({
  bike,
  mode,
}: {
  bike?: Motorcycle;
  mode: "create" | "update";
}) {
  const action = mode === "create" ? createBikeAction : updateBikeAction;
  const [state, formAction, pending] = useActionState<BikeFormState, FormData>(
    action,
    initialBikeFormState,
  );
  const errors = state.fieldErrors ?? {};

  const fieldError = (name: string) => errors[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {bike ? <input type="hidden" name="id" value={bike.id} /> : null}

      {state.status === "error" && state.message ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      <section className="rounded-xl border border-mist-200 bg-white p-5">
        <SectionHeading
          title="Motorcycle identity"
          description="Use the make and model as they appear on the motorcycle and its paperwork."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" htmlFor="brand" required error={fieldError("brand")}>
            <Input
              id="brand"
              name="brand"
              defaultValue={bike?.brand}
              required
              maxLength={40}
              placeholder="e.g. Bajaj, Honda, TVS, UM"
            />
          </Field>

          <Field label="Model" htmlFor="model" required error={fieldError("model")}>
            <Input
              id="model"
              name="model"
              defaultValue={bike?.model}
              required
              maxLength={60}
              placeholder="e.g. Boxer BM 125"
            />
          </Field>

          <Field
            label="URL slug"
            htmlFor="slug"
            optional
            hint="Leave blank to build it automatically. Changing it changes the public link."
            error={fieldError("slug")}
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={bike?.slug}
              maxLength={80}
              placeholder="bajaj-boxer-bm-125-2022"
            />
          </Field>

          <Field
            label="Asking price (KSh)"
            htmlFor="priceKes"
            required
            hint="Whole shillings only, e.g. 125000."
            error={fieldError("priceKes")}
          >
            <Input
              id="priceKes"
              name="priceKes"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              defaultValue={bike?.priceKes}
              placeholder="125000"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-mist-200 bg-white p-5">
        <SectionHeading
          title="Specifications"
          description="Only fill in what you can verify. Blank fields are hidden from the public listing."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Manufacturing year" htmlFor="year" optional error={fieldError("year")}>
            <Input
              id="year"
              name="year"
              type="number"
              inputMode="numeric"
              min={1950}
              max={2100}
              defaultValue={bike?.year ?? ""}
              placeholder="2022"
            />
          </Field>

          <Field label="Engine capacity (cc)" htmlFor="engineCc" optional error={fieldError("engineCc")}>
            <Input
              id="engineCc"
              name="engineCc"
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              defaultValue={bike?.engineCc ?? ""}
              placeholder="125"
            />
          </Field>

          <Field label="Odometer (km)" htmlFor="odometerKm" optional error={fieldError("odometerKm")}>
            <Input
              id="odometerKm"
              name="odometerKm"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={bike?.odometerKm ?? ""}
              placeholder="28000"
            />
          </Field>

          <Field label="Condition" htmlFor="condition" error={fieldError("condition")}>
            <Select id="condition" name="condition" defaultValue={bike?.condition ?? "good"}>
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Transmission" htmlFor="transmission" optional error={fieldError("transmission")}>
            <Select id="transmission" name="transmission" defaultValue={bike?.transmission ?? ""}>
              <option value="">Not recorded</option>
              {TRANSMISSION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Fuel type" htmlFor="fuelType" optional error={fieldError("fuelType")}>
            <Input
              id="fuelType"
              name="fuelType"
              defaultValue={bike?.fuelType ?? "Petrol"}
              maxLength={30}
            />
          </Field>

          <Field label="Colour" htmlFor="colour" optional error={fieldError("colour")}>
            <Input id="colour" name="colour" defaultValue={bike?.colour ?? ""} maxLength={30} placeholder="Red" />
          </Field>

          <Field label="Intended use" htmlFor="usage" optional error={fieldError("usage")}>
            <Select id="usage" name="usage" defaultValue={bike?.usage ?? ""}>
              <option value="">Not recorded</option>
              {USAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Registration / paperwork"
            htmlFor="registration"
            optional
            hint="e.g. Logbook available, transfer in progress."
            error={fieldError("registration")}
          >
            <Input
              id="registration"
              name="registration"
              defaultValue={bike?.registration ?? ""}
              maxLength={120}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-mist-200 bg-white p-5">
        <SectionHeading
          title="Description and condition notes"
          description="Write factually. Buyers rely on this before travelling."
        />
        <div className="grid gap-4">
          <Field
            label="Public description"
            htmlFor="description"
            hint="Separate paragraphs with a blank line."
            error={fieldError("description")}
          >
            <Textarea
              id="description"
              name="description"
              rows={6}
              maxLength={4000}
              defaultValue={bike?.description ?? ""}
              placeholder="Describe the motorcycle, its known condition, notable features and any disclosed faults."
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Inspection notes"
              htmlFor="inspectionNotes"
              optional
              hint="Shown publicly. Note anything a buyer should check."
              error={fieldError("inspectionNotes")}
            >
              <Textarea
                id="inspectionNotes"
                name="inspectionNotes"
                rows={4}
                maxLength={1000}
                defaultValue={bike?.inspectionNotes ?? ""}
              />
            </Field>

            <Field
              label="Service history"
              htmlFor="serviceHistory"
              optional
              hint="Only record history you can evidence."
              error={fieldError("serviceHistory")}
            >
              <Textarea
                id="serviceHistory"
                name="serviceHistory"
                rows={4}
                maxLength={1000}
                defaultValue={bike?.serviceHistory ?? ""}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-mist-200 bg-white p-5">
        <SectionHeading
          title="Publishing and availability"
          description="Only published listings appear on the website. Sold bikes leave the available stock automatically."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Availability status" htmlFor="status" error={fieldError("status")}>
            <Select id="status" name="status" defaultValue={bike?.status ?? "available"}>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="space-y-3 rounded-lg bg-mist-50 p-4">
            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={bike ? bike.isPublished : false}
                className="mt-0.5 size-4 rounded border-mist-300 accent-accent-600"
              />
              <span>
                <span className="font-semibold text-ink-900">Published on the website</span>
                <span className="mt-0.5 block text-xs text-mist-600">
                  Unticked listings stay as private drafts.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={bike?.isFeatured ?? false}
                className="mt-0.5 size-4 rounded border-mist-300 accent-accent-600"
              />
              <span>
                <span className="font-semibold text-ink-900">Feature on the homepage</span>
                <span className="mt-0.5 block text-xs text-mist-600">
                  Featured bikes are shown first, when marked available.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <Field
            label="Internal notes"
            htmlFor="internalNotes"
            optional
            hint="Private to administrators. Never shown on the public site."
            error={fieldError("internalNotes")}
          >
            <Textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              maxLength={2000}
              defaultValue={bike?.internalNotes ?? ""}
              placeholder="Seller contact, commission, repair history, held for a customer…"
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link href="/admin/bikes" className={cn(buttonStyles({ variant: "ghost" }), "justify-center")}>
          Cancel
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" />
              {mode === "create" ? "Create listing" : "Save changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
