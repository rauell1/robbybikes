import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Database,
  Info,
  MessageSquare,
  Plus,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/db/admin-queries";
import { describeDatabase } from "@/lib/db";
import { formatDateTime, formatKes, statusMeta, ENQUIRY_STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();
  const database = describeDatabase();
  const { totals, enquiries } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-mist-600">
            A live view of your website inventory and customer enquiries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/bikes/new" className={buttonStyles({ variant: "primary" })}>
            <Plus className="size-4" aria-hidden="true" />
            Add motorcycle
          </Link>
          <Link href="/admin/enquiries" className={buttonStyles({ variant: "outline" })}>
            <MessageSquare className="size-4" aria-hidden="true" />
            Enquiries
            {enquiries.new > 0 ? (
              <span className="rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {enquiries.new}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {totals.sample > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-start">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              {totals.sample} demonstration listing{totals.sample === 1 ? " is" : "s are"} live
            </p>
            <p className="mt-1 text-amber-900/80">
              Sample records are clearly marked on the public site and use illustrative photos.
              Before launch, import verified stock and remove this data with{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">npm run db:sample:clear</code>.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available"
          value={totals.available}
          hint={`${totals.published} published listings`}
          icon={CheckCircle2}
          href="/admin/bikes?status=available"
        />
        <StatCard
          label="Pending sale"
          value={totals.pendingSale}
          hint={`${totals.reserved} reserved`}
          icon={ShoppingBag}
          tone="warning"
          href="/admin/bikes?status=pending_sale"
        />
        <StatCard
          label="Sold"
          value={totals.sold}
          hint="Kept in the sold archive"
          icon={CircleDollarSign}
          tone="muted"
          href="/admin/bikes?status=sold"
        />
        <StatCard
          label="New enquiries"
          value={enquiries.new}
          hint={`${enquiries.total} total recorded`}
          icon={MessageSquare}
          tone="accent"
          href="/admin/enquiries?status=new"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-mist-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Bike className="size-4 text-mist-500" aria-hidden="true" />
            Catalogue
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-mist-600">All records</dt>
              <dd className="font-semibold text-ink-900">{totals.all}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-600">Published</dt>
              <dd className="font-semibold text-ink-900">{totals.published}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-600">Unpublished drafts</dt>
              <dd className="font-semibold text-ink-900">{totals.unpublished}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist-600">Sample records</dt>
              <dd className="font-semibold text-ink-900">{totals.sample}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-mist-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <ClipboardList className="size-4 text-mist-500" aria-hidden="true" />
            Enquiry pipeline
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {(
              [
                ["new", enquiries.new],
                ["contacted", enquiries.contacted],
                ["in_progress", enquiries.inProgress],
                ["closed", enquiries.closed],
              ] as const
            ).map(([status, value]) => (
              <div key={status} className="flex justify-between gap-4">
                <dt className="text-mist-600">{ENQUIRY_STATUS_LABELS[status]}</dt>
                <dd className="font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-mist-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Database className="size-4 text-mist-500" aria-hidden="true" />
            Data source
          </div>
          <p className="mt-3 text-sm font-medium text-ink-900">
            {database.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mist-500">
            {database.driver === "neon"
              ? "Connected through DATABASE_URL. Backups are managed in the Neon console."
              : `${database.host ? `Connected to ${database.host}. ` : ""}The demo database is for local previews only. Configure Neon before production.`}
          </p>
          <p className="mt-3 flex items-start gap-1.5 rounded-md bg-mist-50 p-2 text-[11px] leading-relaxed text-mist-600">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Uploaded photos go to Vercel Blob in production, or .data/uploads locally.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-mist-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-900">Recent inventory changes</h2>
            <Link
              href="/admin/bikes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800"
            >
              Manage stock
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          {data.recentBikes.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mist-500">
              No motorcycles yet.{" "}
              <Link href="/admin/bikes/new" className="font-semibold text-accent-700">
                Add your first listing
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.recentBikes.map((bike) => {
                const status = statusMeta(bike.status);
                return (
                  <li key={bike.id}>
                    <Link
                      href={`/admin/bikes/${bike.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-mist-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {bike.brand} {bike.model}
                        </p>
                        <p className="mt-0.5 text-xs text-mist-500">
                          {formatKes(bike.priceKes)} · updated {formatDateTime(bike.updatedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!bike.isPublished ? <Badge tone="neutral">Draft</Badge> : null}
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-mist-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-mist-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-900">Latest enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          {data.recentEnquiries.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-mist-500">
              No enquiries yet. Once a customer submits the contact form it will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-mist-100">
              {data.recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="block px-4 py-3 transition-colors hover:bg-mist-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-ink-900">{enquiry.customerName}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          enquiry.status === "new"
                            ? "bg-accent-50 text-accent-800"
                            : "bg-mist-100 text-mist-600",
                        )}
                      >
                        {ENQUIRY_STATUS_LABELS[enquiry.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-mist-600">{enquiry.message}</p>
                    <p className="mt-1 text-[11px] text-mist-500">
                      {enquiry.motorcycle
                        ? `${enquiry.motorcycle.brand} ${enquiry.motorcycle.model} · `
                        : ""}
                      {formatDateTime(enquiry.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-mist-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Before you go live</h2>
        <ol className="mt-2 grid gap-2 text-sm text-mist-600 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Import verified stock (CSV or manually).",
            "Add real photographs for every motorcycle.",
            "Remove sample data and set real logins.",
            "Connect Neon, Blob and your domain on Vercel.",
          ].map((item, index) => (
            <li key={item} className="flex gap-2 rounded-lg bg-mist-50 p-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-mist-500">
          Full instructions are in <code className="rounded bg-mist-100 px-1 py-0.5 font-mono">README.md</code>{" "}
          and <code className="rounded bg-mist-100 px-1 py-0.5 font-mono">docs/</code>.
        </p>
      </div>
    </div>
  );
}
