import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Download, Eye, EyeOff, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { listAdminBikes } from "@/lib/db/admin-queries";
import { getDb } from "@/lib/db";
import { motorcycles, type MotorcycleStatus } from "@/lib/db/schema";
import { formatDateTime, formatKes, statusMeta } from "@/lib/format";
import { setBikePublishedAction, duplicateBikeAction } from "@/lib/actions/admin-bike-actions";
import { QuickStatusSelect } from "@/components/admin/quick-status-select";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "pending_sale", label: "Pending sale" },
  { value: "sold", label: "Sold" },
  { value: "unpublished", label: "Drafts" },
];

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string; deleted?: string }>;
};

function parseStatus(value: string | undefined): MotorcycleStatus | "all" | "unpublished" {
  if (value && STATUS_TABS.some((tab) => tab.value === value) && value !== "all" && value !== "unpublished") {
    return value as MotorcycleStatus;
  }
  if (value === "unpublished") return "unpublished";
  return "all";
}

export default async function AdminBikesPage({ searchParams }: PageProps) {
  await requireAdmin("/admin/bikes");
  const params = await searchParams;

  const q = (params.q ?? "").trim().slice(0, 80);
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const [result, counts] = await Promise.all([
    listAdminBikes({ q, status, page }),
    getStatusCounts(),
  ]);

  const buildHref = (overrides: { status?: string; page?: number }) => {
    const search = new URLSearchParams();
    const nextStatus = overrides.status ?? status;
    if (q) search.set("q", q);
    if (nextStatus !== "all") search.set("status", nextStatus);
    if (overrides.page && overrides.page > 1) search.set("page", String(overrides.page));
    const query = search.toString();
    return `/admin/bikes${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Inventory</h1>
          <p className="mt-1 text-sm text-mist-600">
            {result.total} record{result.total === 1 ? "" : "s"} in this view.
          </p>
        </div>
        <Link href="/admin/bikes/new" className={buttonStyles({ variant: "primary" })}>
          <Plus className="size-4" aria-hidden="true" />
          Add motorcycle
        </Link>
      </div>

      {params.deleted ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Listing deleted.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-mist-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/bikes" method="get" className="flex flex-1 gap-2">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="inventory-search" className="sr-only">
            Search inventory
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400"
              aria-hidden="true"
            />
            <input
              id="inventory-search"
              name="q"
              defaultValue={q}
              placeholder="Search brand, model or slug"
              className="h-10 w-full rounded-lg border border-mist-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-mist-500 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
            />
          </div>
          <button type="submit" className={buttonStyles({ variant: "outline", size: "md" })}>
            Search
          </button>
        </form>

        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value, page: 1 })}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                status === tab.value
                  ? "bg-ink-900 text-white"
                  : "bg-mist-100 text-ink-700 hover:bg-mist-200",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  status === tab.value ? "bg-white/20" : "bg-white/70",
                )}
              >
                {counts[tab.value] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mist-300 bg-white p-10 text-center">
          <h2 className="text-base font-semibold text-ink-900">No motorcycles in this view</h2>
          <p className="mt-1 text-sm text-mist-600">
            Try a different filter, or add a new listing to get started.
          </p>
          <Link href="/admin/bikes/new" className={cn(buttonStyles({ variant: "primary" }), "mt-4")}>
            <Plus className="size-4" aria-hidden="true" />
            Add motorcycle
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-mist-200 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-mist-50 text-xs uppercase tracking-wide text-mist-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Motorcycle</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Visibility</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-100">
                {result.items.map((bike) => {
                  const status = statusMeta(bike.status);
                  return (
                    <tr key={bike.id} className="align-middle hover:bg-mist-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-mist-100">
                            {bike.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={bike.images[0].imageUrl}
                                alt=""
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/bikes/${bike.id}`} className="font-semibold text-ink-900 hover:text-accent-700">
                              {bike.brand} {bike.model}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist-500">
                              {bike.year ? `${bike.year} · ` : ""}
                              {bike.engineCc ? `${bike.engineCc} cc · ` : ""}
                              <span className="truncate font-mono text-[10px]">/{bike.slug}</span>
                            </p>
                            {bike.isSample ? <Badge tone="sample" className="mt-1">Sample</Badge> : null}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink-900">
                        {formatKes(bike.priceKes)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status.tone} dot>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <form action={setBikePublishedAction}>
                          <input type="hidden" name="id" value={bike.id} />
                          <input type="hidden" name="publish" value={String(!bike.isPublished)} />
                          <button
                            type="submit"
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold",
                              bike.isPublished
                                ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                : "bg-mist-100 text-mist-600 hover:bg-mist-200",
                            )}
                          >
                            {bike.isPublished ? (
                              <Eye className="size-3.5" aria-hidden="true" />
                            ) : (
                              <EyeOff className="size-3.5" aria-hidden="true" />
                            )}
                            {bike.isPublished ? "Published" : "Draft"}
                          </button>
                        </form>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-mist-500">
                        {formatDateTime(bike.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/bikes/${bike.id}`}
                          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-50"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {result.items.map((bike) => {
              const status = statusMeta(bike.status);
              return (
                <li key={bike.id} className="rounded-xl border border-mist-200 bg-white p-4">
                  <div className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-mist-100">
                      {bike.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bike.images[0].imageUrl}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/bikes/${bike.id}`} className="text-sm font-semibold text-ink-900">
                          {bike.brand} {bike.model}
                        </Link>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink-900">{formatKes(bike.priceKes)}</p>
                      <p className="mt-0.5 text-xs text-mist-500">
                        {bike.isPublished ? "Published" : "Draft"}
                        {bike.isSample ? " · Sample" : ""} · {formatDateTime(bike.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <form action={setBikePublishedAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="publish" value={String(!bike.isPublished)} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md border border-mist-300 px-2.5 py-1.5 text-xs font-semibold text-ink-800"
                      >
                        {bike.isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        {bike.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/bikes/${bike.id}`}
                      className={buttonStyles({ variant: "dark", size: "sm" })}
                    >
                      Edit listing
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {result.pageCount > 1 ? (
            <nav className="flex items-center justify-between gap-3" aria-label="Inventory pages">
              <p className="text-xs text-mist-500">
                Page {result.page} of {result.pageCount}
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link href={buildHref({ page: result.page - 1 })} className={buttonStyles({ variant: "outline", size: "sm" })}>
                    Previous
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link href={buildHref({ page: result.page + 1 })} className={buttonStyles({ variant: "outline", size: "sm" })}>
                    Next
                  </Link>
                ) : null}
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

async function getStatusCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db
    .select({ status: motorcycles.status })
    .from(motorcycles);

  const counts: Record<string, number> = {
    all: rows.length,
    available: 0,
    reserved: 0,
    pending_sale: 0,
    sold: 0,
    unpublished: 0,
  };

  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const unpublished = await db
    .select({ id: motorcycles.id })
    .from(motorcycles)
    .where(eq(motorcycles.isPublished, false));
  counts.unpublished = unpublished.length;

  return counts;
}
