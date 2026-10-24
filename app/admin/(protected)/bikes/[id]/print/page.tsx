import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { PrintButton } from "@/components/admin/print-button";
import { requireAdmin } from "@/lib/auth";
import { getBikeById } from "@/lib/db/queries";
import { business } from "@/lib/business";
import { formatEngine, formatKes, formatOdometer } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = { title: "Print showroom price tag" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintSpecSheetPage({ params }: PageProps) {
  const { id } = await params;
  await requireAdmin(`/admin/bikes/${id}/print`);

  const bike = await getBikeById(id);
  if (!bike) notFound();

  const listingUrl = absoluteUrl(`/bikes/${bike.slug}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(listingUrl)}`;

  const specs = [
    { label: "Manufacturing year", value: bike.year ? String(bike.year) : "Not recorded" },
    { label: "Engine displacement", value: formatEngine(bike.engineCc) || "Not recorded" },
    { label: "Odometer reading", value: formatOdometer(bike.odometerKm) || "Not recorded" },
    { label: "Condition grade", value: bike.condition.replaceAll("_", " ").toUpperCase() },
    { label: "Fuel system", value: bike.fuelType || "Petrol" },
    { label: "Transmission", value: bike.transmission || "Manual" },
    { label: "Colour", value: bike.colour || "Not recorded" },
    { label: "Registration / Logbook", value: bike.registration || "Verified on site" },
  ];

  return (
    <div className="min-h-screen bg-mist-100 p-4 sm:p-8 print:bg-white print:p-0">
      {/* Top Action Bar (hidden when printing) */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between rounded-xl bg-white p-4 shadow-sm print:hidden">
        <Link
          href={`/admin/bikes/${bike.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" />
          Back to bike details
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-mist-500">
            A4 sheet format: perfect for showroom windows or handlebar tags.
          </p>
          <PrintButton />
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="mx-auto max-w-3xl rounded-2xl border-2 border-mist-300 bg-white p-8 shadow-md print:border-0 print:p-6 print:shadow-none">
        {/* Dealership Header */}
        <div className="flex items-start justify-between border-b-2 border-ink-950 pb-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-ink-950 uppercase">
              ROBBYBIKES
            </h1>
            <p className="text-xs font-bold text-mist-600 mt-0.5 uppercase tracking-wider">
              Used & Second-Hand Motorcycle Dealership : Nairobi, Kenya
            </p>
            <p className="text-xs text-mist-500 mt-1">
              Juja Road, Eastleigh : Near Amana / Luqman Petrol Station
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block rounded bg-ink-950 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Official Stock
            </span>
            <div className="mt-2 text-xs font-bold text-ink-900 space-y-0.5">
              <p className="flex items-center justify-end gap-1">
                <Phone className="size-3 text-accent-600" />
                {business.phones[0].display}
              </p>
              <p className="flex items-center justify-end gap-1 text-mist-600 font-semibold">
                <Phone className="size-3 text-mist-400" />
                {business.phones[1].display}
              </p>
            </div>
          </div>
        </div>

        {/* Bike Title & Price Banner */}
        <div className="my-6">
          <p className="text-sm font-black uppercase tracking-widest text-accent-700">
            {bike.brand}
          </p>
          <h2 className="text-4xl font-black tracking-tight text-ink-950 uppercase mt-0.5">
            {bike.model} {bike.year ? `(${bike.year})` : ""}
          </h2>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-950 p-5 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                Asking Showroom Price
              </p>
              <p className="text-4xl font-black tracking-tight text-white mt-0.5">
                {formatKes(bike.priceKes)}
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                In Stock & Verified
              </span>
              <p className="text-[11px] text-white/60 mt-1.5">
                Negotiation on physical inspection
              </p>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="my-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-mist-500 border-b border-mist-200 pb-1 mb-3">
            Motorcycle Specifications
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {specs.map((item) => (
              <div key={item.label} className="rounded-lg border border-mist-200 p-2.5 bg-mist-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mist-500 block">
                  {item.label}
                </span>
                <span className="font-bold text-ink-900 mt-0.5 block text-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dealership Assurance Checklist & QR Code Footer */}
        <div className="mt-6 border-t-2 border-mist-200 pt-5 flex items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-900">
              Robbybikes Dealership Verification
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-ink-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>Cold engine start tested</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>Original Logbook verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>Chassis welds inspected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>NTSA transfer support</span>
              </div>
            </div>
            <p className="text-[10px] text-mist-500 mt-2">
              Website: robbybikes.vercel.app : Physical Yard: Juja Road, Eastleigh, Nairobi
            </p>
          </div>

          <div className="shrink-0 text-center border-l border-mist-200 pl-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Scan to view online listing"
              className="size-24 rounded-lg border border-mist-300 p-1 mx-auto"
            />
            <p className="text-[10px] font-bold text-ink-900 mt-1 uppercase tracking-wider">
              Scan for photos
            </p>
            <p className="text-[9px] text-mist-400">View online listing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
