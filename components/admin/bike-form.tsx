"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useActionState } from "react";
import { Camera, ImagePlus, Link2, Loader2, Save, Upload, X } from "lucide-react";
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
import { optimizeImageForUpload } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

const STATUS_ORDER: MotorcycleStatus[] = ["available", "reserved", "pending_sale", "sold"];

type LocalPhotoPreview = {
  id: string;
  file: File;
  previewUrl: string;
};

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

  const [selectedPhotos, setSelectedPhotos] = useState<LocalPhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncInputFiles = (photos: LocalPhotoPreview[]) => {
    if (typeof window === "undefined" || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      photos.forEach((p) => dt.items.add(p.file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    } catch {
      // Fallback: browser handles file input directly
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList).filter(
      (file) => file.type.startsWith("image/") && file.size > 0 && file.size <= 30 * 1024 * 1024,
    );
    if (rawFiles.length === 0) return;

    setIsOptimizing(true);
    try {
      const optimizedFiles = await Promise.all(
        rawFiles.map((file) => optimizeImageForUpload(file)),
      );

      const newPreviews: LocalPhotoPreview[] = optimizedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setSelectedPhotos((prev) => {
        const updated = [...prev, ...newPreviews];
        setTimeout(() => syncInputFiles(updated), 0);
        return updated;
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const updated = prev.filter((p) => p.id !== id);
      syncInputFiles(updated);
      return updated;
    });
  };

  const clearAllPhotos = () => {
    selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setSelectedPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [selectedPhotos]);

  const fieldError = (name: string) => errors[name]?.[0];

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      {bike ? <input type="hidden" name="id" value={bike.id} /> : null}

      {state.status === "error" && state.message ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.message}
        </div>
      ) : null}

      {/* 1. Identity */}
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

      {/* 2. Photographs */}
      <section className="rounded-xl border border-mist-200 bg-white p-5">
        <SectionHeading
          title="Photographs"
          description={
            mode === "create"
              ? "Upload photos of the motorcycle. The first photo is the main cover image shown across the website."
              : "Upload new photos or add an image URL to attach to this listing."
          }
        />

        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
              isDragging
                ? "border-accent-500 bg-accent-50/50"
                : "border-mist-300 bg-mist-50/60 hover:border-mist-400 hover:bg-mist-50",
            )}
          >
            <input
              ref={fileInputRef}
              id="photos"
              name="photos"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFilesChange}
              className="sr-only"
            />
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-mist-200 group-hover:scale-105 transition-transform">
              <Upload className="size-6 text-accent-600" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-900">
              Click or tap to upload photos, or drag and drop
            </p>
            {isOptimizing ? (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-accent-700">
                <Loader2 className="size-3.5 animate-spin text-accent-600" aria-hidden="true" />
                Optimizing photos for fast loading...
              </div>
            ) : (
              <p className="mt-1 text-xs text-mist-500">
                Select one or multiple photos: JPG, PNG, WebP or AVIF. Automatically optimized for fast mobile loading.
              </p>
            )}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mist-100 px-3 py-1 text-[11px] font-medium text-mist-700">
              <Camera className="size-3 text-mist-500" aria-hidden="true" />
              First photo selected will be the main cover image
            </div>
          </div>

          {selectedPhotos.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-900">
                  Selected photos ({selectedPhotos.length})
                </span>
                <button
                  type="button"
                  onClick={clearAllPhotos}
                  className="text-xs text-mist-500 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-mist-200 bg-mist-100 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={`Selected motorcycle photo ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    {index === 0 ? (
                      <span className="absolute left-1.5 top-1.5 rounded bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        Cover photo
                      </span>
                    ) : (
                      <span className="absolute left-1.5 top-1.5 rounded bg-ink-950/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Photo {index + 1}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-mist-700 shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove this photo"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] text-white">
                      <span className="truncate max-w-[70%]">{photo.file.name}</span>
                      <span>{(photo.file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-mist-100 pt-3">
            <Field
              label="Or add photo by web link (optional)"
              htmlFor="imageUrl"
              optional
              hint="Paste a direct https:// image link if your photo is hosted elsewhere."
            >
              <div className="relative">
                <Link2 className="absolute left-3 top-2.5 size-4 text-mist-400" aria-hidden="true" />
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://images.example.com/motorcycle.jpg"
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* 3. Specifications */}
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

      {/* 4. Description and notes */}
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

      {/* 5. Publishing */}
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
                  Ticking this makes the motorcycle and its photographs go live on the public website immediately upon saving.
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
        <Button type="submit" size="lg" disabled={pending || isOptimizing}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {mode === "create" ? "Creating listing and uploading photos..." : "Saving changes..."}
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
