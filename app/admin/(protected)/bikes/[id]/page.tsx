import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { BikeForm } from "@/components/admin/bike-form";
import { ImageManager } from "@/components/admin/image-manager";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { getBikeById } from "@/lib/db/queries";
import { deleteBikeAction, setBikeStatusAction } from "@/lib/actions/admin-bike-actions";
import { formatDateTime, formatKes, statusMeta, STATUS_LABELS } from "@/lib/format";

export const metadata: Metadata = { title: "Edit motorcycle" };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
};

export default async function EditBikePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  await requireAdmin(`/admin/bikes/${id}`);
  const query = await searchParams;

  const bike = await getBikeById(id);
  if (!bike) notFound();

  const status = statusMeta(bike.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/bikes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-600 hover:text-ink-900"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to inventory
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
            {bike.brand} {bike.model}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-mist-600">
            <span className="font-semibold text-ink-900">{formatKes(bike.priceKes)}</span>
            <span aria-hidden="true">·</span>
            <Badge tone={status.tone} dot>{status.label}</Badge>
            {bike.isPublished ? (
              <Badge tone="available">Published</Badge>
            ) : (
              <Badge tone="neutral">Draft</Badge>
            )}
            {bike.isSample ? <Badge tone="sample">Sample</Badge> : null}
            <span className="text-xs text-mist-500">Updated {formatDateTime(bike.updatedAt)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {bike.isPublished ? (
            <Link
              href={`/bikes/${bike.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View public listing
            </Link>
          ) : null}
          <Link href="/admin/bikes/new" className={buttonStyles({ variant: "dark", size: "sm" })}>
            Add another
          </Link>
        </div>
      </div>

      {query.created ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Listing created. Add photographs below, then publish it when it is ready.
        </p>
      ) : null}
      {query.saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Changes saved.
        </p>
      ) : null}

      <div className="rounded-xl border border-mist-200 bg-white p-4">
        <form action={setBikeStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={bike.id} />
          <div className="sm:w-56">
            <label htmlFor="quick-status" className="field-label">
              Quick availability change
            </label>
            <Select id="quick-status" name="status" defaultValue={bike.status}>
              {(["available", "reserved", "pending_sale", "sold"] as const).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
          <button type="submit" className={buttonStyles({ variant: "dark", size: "md" })}>
            Update status
          </button>
          <p className="text-xs text-mist-500 sm:pb-3">
            Sold bikes are hidden from available stock but remain in the sold archive.
          </p>
        </form>
      </div>

      <BikeForm bike={bike} mode="update" />

      <ImageManager bikeId={bike.id} images={bike.images} />

      <section className="rounded-xl border border-red-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-mist-600">
          Deleting a listing removes it from the website along with its uploaded photographs. This
          cannot be undone. If the motorcycle has been sold, change its status to Sold instead so the
          record is preserved.
        </p>
        <form action={deleteBikeAction} className="mt-3">
          <input type="hidden" name="id" value={bike.id} />
          <ConfirmButton
            message={`Delete ${bike.brand} ${bike.model} permanently? This also removes its photos.`}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete listing
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
