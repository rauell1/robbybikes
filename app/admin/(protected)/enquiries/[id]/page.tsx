import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Mail, Phone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EnquiryUpdateForm } from "@/components/admin/enquiry-update-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { WhatsAppIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { getEnquiryById } from "@/lib/db/admin-queries";
import { deleteEnquiryAction } from "@/lib/actions/admin-enquiry-actions";
import {
  ENQUIRY_STATUS_LABELS,
  contactMethodLabel,
  formatDateTime,
  formatKes,
} from "@/lib/format";

export const metadata: Metadata = { title: "Enquiry" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EnquiryDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireAdmin(`/admin/enquiries/${id}`);

  const enquiry = await getEnquiryById(id);
  if (!enquiry) notFound();

  const digits = enquiry.phoneNumber.replace(/[^\d]/g, "");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to enquiries
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{enquiry.customerName}</h1>
          <Badge tone={enquiry.status === "new" ? "accent" : "neutral"}>
            {ENQUIRY_STATUS_LABELS[enquiry.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-mist-600">
          Received {formatDateTime(enquiry.createdAt)} · prefers{" "}
          {contactMethodLabel(enquiry.preferredContactMethod)} · source{" "}
          <span className="font-mono text-xs">{enquiry.source}</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Customer message</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-800">
              {enquiry.message}
            </p>
            <p className="mt-4 border-t border-mist-100 pt-3 text-[11px] text-mist-500">
              Consent recorded {formatDateTime(enquiry.consentRecordedAt)}. Use these details only to
              respond to this enquiry.
            </p>
          </section>

          <section className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Follow up</h2>
            <div className="mt-3">
              <EnquiryUpdateForm
                enquiryId={enquiry.id}
                status={enquiry.status}
                internalNotes={enquiry.internalNotes}
              />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Contact</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${digits}`}
                  className="flex items-center gap-2 font-semibold text-ink-900 hover:text-accent-700"
                >
                  <Phone className="size-4 text-mist-400" aria-hidden="true" />
                  {enquiry.phoneNumber}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${digits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-semibold text-whatsapp-dark hover:underline"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp customer
                </a>
              </li>
              {enquiry.email ? (
                <li>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="flex items-center gap-2 text-ink-800 hover:text-accent-700"
                  >
                    <Mail className="size-4 text-mist-400" aria-hidden="true" />
                    {enquiry.email}
                  </a>
                </li>
              ) : (
                <li className="text-xs text-mist-500">No email address provided.</li>
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Motorcycle of interest</h2>
            {enquiry.motorcycle ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-ink-900">
                  {enquiry.motorcycle.brand} {enquiry.motorcycle.model}
                </p>
                <p className="text-mist-600">{formatKes(enquiry.motorcycle.priceKes)}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/admin/bikes/${enquiry.motorcycle.id}`}
                    className={buttonStyles({ variant: "dark", size: "sm" })}
                  >
                    Open listing
                  </Link>
                  <Link
                    href={`/bikes/${enquiry.motorcycle.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    Public page
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-mist-600">
                General enquiry — no specific motorcycle selected.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-red-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-red-800">Delete enquiry</h2>
            <p className="mt-1 text-xs leading-relaxed text-mist-600">
              Only delete enquiries that are spam, duplicated, or that the customer has asked you to
              remove.
            </p>
            <form action={deleteEnquiryAction} className="mt-3">
              <input type="hidden" name="id" value={enquiry.id} />
              <ConfirmButton
                message="Delete this enquiry permanently?"
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </ConfirmButton>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
