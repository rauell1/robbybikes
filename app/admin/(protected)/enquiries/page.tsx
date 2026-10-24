import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getEnquiryCounts, listEnquiries } from "@/lib/db/admin-queries";
import { ENQUIRY_STATUS_LABELS, contactMethodLabel, formatDateTime, formatKes } from "@/lib/format";
import { setEnquiryStatusAction } from "@/lib/actions/admin-enquiry-actions";
import type { EnquiryStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
] as const;

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string; deleted?: string }>;
};

function parseStatus(value: string | undefined): EnquiryStatus | "all" {
  if (value && TABS.some((tab) => tab.value === value) && value !== "all") {
    return value as EnquiryStatus;
  }
  return "all";
}

const TONE: Record<EnquiryStatus, "accent" | "neutral" | "available" | "sold"> = {
  new: "accent",
  contacted: "neutral",
  in_progress: "available",
  closed: "sold",
};

export default async function AdminEnquiriesPage({ searchParams }: PageProps) {
  await requireAdmin("/admin/enquiries");
  const params = await searchParams;

  const q = (params.q ?? "").trim().slice(0, 80);
  const status = parseStatus(params.status);
  const page = Math.max(1, Number(params.page) || 1);

  const [result, counts] = await Promise.all([
    listEnquiries({ status, q, page }),
    getEnquiryCounts(),
  ]);

  const buildHref = (overrides: { status?: string; page?: number }) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const nextStatus = overrides.status ?? status;
    if (nextStatus !== "all") search.set("status", nextStatus);
    if (overrides.page && overrides.page > 1) search.set("page", String(overrides.page));
    const query = search.toString();
    return `/admin/enquiries${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Customer enquiries</h1>
        <p className="mt-1 text-sm text-mist-600">
          {counts.new} new · {counts.all} total. Enquiries come from the contact form and individual
          listings.
        </p>
      </div>

      {params.deleted ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Enquiry deleted.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-mist-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/enquiries" method="get" className="flex flex-1 gap-2">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="enquiry-search" className="sr-only">
            Search enquiries
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400"
              aria-hidden="true"
            />
            <input
              id="enquiry-search"
              name="q"
              defaultValue={q}
              placeholder="Search name, phone or message"
              className="h-10 w-full rounded-lg border border-mist-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-mist-500 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
            />
          </div>
          <button type="submit" className={buttonStyles({ variant: "outline", size: "md" })}>
            Search
          </button>
        </form>

        <div className="flex gap-1.5 overflow-x-auto">
          {TABS.map((tab) => (
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
                {counts[tab.value]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mist-300 bg-white p-10 text-center">
          <h2 className="text-base font-semibold text-ink-900">No enquiries in this view</h2>
          <p className="mt-1 text-sm text-mist-600">
            When a customer submits the website form, their enquiry appears here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {result.items.map((enquiry) => {
            const digits = enquiry.phoneNumber.replace(/[^\d]/g, "");
            return (
              <li key={enquiry.id} className="rounded-xl border border-mist-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="text-sm font-semibold text-ink-900 hover:text-accent-700"
                      >
                        {enquiry.customerName}
                      </Link>
                      <Badge tone={TONE[enquiry.status]}>{ENQUIRY_STATUS_LABELS[enquiry.status]}</Badge>
                      <span className="text-[11px] text-mist-500">
                        {formatDateTime(enquiry.createdAt)} · prefers{" "}
                        {contactMethodLabel(enquiry.preferredContactMethod)}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-mist-700">{enquiry.message}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-500">
                      <a href={`tel:${digits}`} className="inline-flex items-center gap-1 hover:text-ink-900">
                        <Phone className="size-3" aria-hidden="true" />
                        {enquiry.phoneNumber}
                      </a>
                      <a
                        href={`https://wa.me/${digits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-ink-900"
                      >
                        <WhatsAppIcon className="size-3" />
                        WhatsApp customer
                      </a>
                      {enquiry.motorcycle ? (
                        <span>
                          Bike:{" "}
                          <Link
                            href={`/admin/bikes/${enquiry.motorcycle.id}`}
                            className="font-medium text-accent-700 hover:text-accent-800"
                          >
                            {enquiry.motorcycle.brand} {enquiry.motorcycle.model} ·{" "}
                            {formatKes(enquiry.motorcycle.priceKes)}
                          </Link>
                        </span>
                      ) : (
                        <span>General enquiry</span>
                      )}
                      <span className="font-mono text-[10px] uppercase text-mist-500">
                        {enquiry.source}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {enquiry.status === "new" ? (
                      <form action={setEnquiryStatusAction}>
                        <input type="hidden" name="id" value={enquiry.id} />
                        <input type="hidden" name="status" value="contacted" />
                        <button
                          type="submit"
                          className="rounded-md border border-mist-300 px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-mist-50"
                        >
                          Mark contacted
                        </button>
                      </form>
                    ) : null}
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className={buttonStyles({ variant: "dark", size: "sm" })}
                    >
                      Open enquiry
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {result.pageCount > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Enquiry pages">
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
    </div>
  );
}
