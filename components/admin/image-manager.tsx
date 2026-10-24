"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Link2,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  addBikeImageUrlAction,
  deleteBikeImageAction,
  makePrimaryImageAction,
  moveBikeImageAction,
  uploadBikeImageAction,
  type ActionState,
} from "@/lib/actions/admin-bike-actions";
import { initialActionState } from "@/lib/actions/state";
import type { MotorcycleImage } from "@/lib/db/schema";

export function ImageManager({
  bikeId,
  images,
}: {
  bikeId: string;
  images: MotorcycleImage[];
}) {
  const [uploadState, uploadAction, uploading] = useActionState<ActionState, FormData>(
    uploadBikeImageAction,
    initialActionState,
  );
  const [urlState, urlAction, addingUrl] = useActionState<ActionState, FormData>(
    addBikeImageUrlAction,
    initialActionState,
  );

  return (
    <section className="rounded-xl border border-mist-200 bg-white p-5">
      <div className="border-b border-mist-200 pb-3">
        <h2 className="text-sm font-semibold text-ink-900">Photographs</h2>
        <p className="mt-0.5 text-xs text-mist-500">
          The first photo is the main image. Use the arrows to reorder, or set any photo as primary.
        </p>
      </div>

      {images.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-mist-300 bg-mist-50 p-4 text-sm text-mist-600">
          No photos yet. A listing without a photo shows a placeholder on the website.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-lg border border-mist-200">
              <div className="relative aspect-[4/3] bg-mist-100">
                <Image
                  src={image.imageUrl}
                  alt={image.altText || "Motorcycle photo"}
                  fill
                  sizes="(max-width: 640px) 45vw, 200px"
                  className="object-cover"
                  unoptimized={image.imageUrl.startsWith("/api/uploads/")}
                />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-ink-950/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Main photo
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 p-2">
                <p className="truncate text-[11px] text-mist-500" title={image.altText}>
                  {image.altText || "No alt text"}
                </p>
                <div className="flex items-center gap-1">
                  <form action={moveBikeImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="grid size-7 place-items-center rounded border border-mist-200 text-mist-600 hover:bg-mist-50 disabled:opacity-40"
                      aria-label={`Move photo ${index + 1} earlier`}
                    >
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                  <form action={moveBikeImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === images.length - 1}
                      className="grid size-7 place-items-center rounded border border-mist-200 text-mist-600 hover:bg-mist-50 disabled:opacity-40"
                      aria-label={`Move photo ${index + 1} later`}
                    >
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                  <form action={makePrimaryImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="grid size-7 place-items-center rounded border border-mist-200 text-mist-600 hover:bg-mist-50 disabled:opacity-40"
                      aria-label={`Use photo ${index + 1} as the main image`}
                    >
                      <Star className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                  <form action={deleteBikeImageAction} className="ml-auto">
                    <input type="hidden" name="imageId" value={image.id} />
                    <button
                      type="submit"
                      className="grid size-7 place-items-center rounded border border-red-200 text-red-600 hover:bg-red-50"
                      aria-label={`Delete photo ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-5 border-t border-mist-200 pt-5 lg:grid-cols-2">
        <form action={uploadAction} className="space-y-3">
          <input type="hidden" name="bikeId" value={bikeId} />
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist-600">
            <ImagePlus className="size-3.5" aria-hidden="true" />
            Upload a photo
          </h3>
          <div>
            <label htmlFor="image" className="field-label">
              Image file
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full cursor-pointer rounded-lg border border-mist-300 bg-white p-2 text-xs text-mist-600 file:mr-3 file:rounded-md file:border-0 file:bg-ink-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            <p className="field-hint">JPG, PNG, WebP or AVIF. Maximum 6 MB.</p>
          </div>
          <Field label="Alt text" htmlFor="upload-alt" optional hint="Describe the photo for screen readers.">
            <Input id="upload-alt" name="altText" maxLength={160} placeholder="Red commuter motorcycle, side view" />
          </Field>
          {uploadState.message ? (
            <p
              className={
                uploadState.status === "error"
                  ? "rounded-md bg-red-50 px-3 py-2 text-xs text-red-800"
                  : "rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
              }
              role={uploadState.status === "error" ? "alert" : "status"}
            >
              {uploadState.message}
            </p>
          ) : null}
          <Button type="submit" variant="dark" size="sm" disabled={uploading}>
            {uploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Upload photo
          </Button>
        </form>

        <form action={urlAction} className="space-y-3">
          <input type="hidden" name="bikeId" value={bikeId} />
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist-600">
            <Link2 className="size-3.5" aria-hidden="true" />
            Add a photo by link
          </h3>
          <Field
            label="Image URL"
            htmlFor="imageUrl"
            hint="A full https:// link (for example a Vercel Blob URL) or a path starting with /."
          >
            <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" />
          </Field>
          <Field label="Alt text" htmlFor="url-alt" optional>
            <Input id="url-alt" name="altText" maxLength={160} />
          </Field>
          {urlState.message ? (
            <p
              className={
                urlState.status === "error"
                  ? "rounded-md bg-red-50 px-3 py-2 text-xs text-red-800"
                  : "rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
              }
              role={urlState.status === "error" ? "alert" : "status"}
            >
              {urlState.message}
            </p>
          ) : null}
          <Button type="submit" variant="outline" size="sm" disabled={addingUrl}>
            {addingUrl ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Add photo link
          </Button>
        </form>
      </div>
    </section>
  );
}
