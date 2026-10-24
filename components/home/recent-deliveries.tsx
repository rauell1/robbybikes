import Link from "next/link";
import { ArrowRight, CheckCircle2, KeyRound, MapPin, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { business } from "@/lib/business";

const RECENT_DELIVERIES = [
  {
    model: "Bajaj Boxer BM 150",
    year: "2022",
    rider: "Peter M.",
    purpose: "Boda boda service along Juja Road and Pangani",
    verification: "Original Logbook verified and handed over",
    town: "Eastleigh, Nairobi",
  },
  {
    model: "TVS HLX 125",
    year: "2021",
    rider: "Dennis K.",
    purpose: "Fast courier and parcel delivery operations in Nairobi CBD",
    verification: "NTSA TIMS transfer assistance handled on site",
    town: "Juja Road Yard",
  },
  {
    model: "Honda Ace CB 125",
    year: "2020",
    rider: "Joseph O.",
    purpose: "Daily commute from Kasarani to Industrial Area",
    verification: "Cold engine tested and mechanic inspected",
    town: "Eastleigh, Nairobi",
  },
  {
    model: "Bajaj Boxer BM 100",
    year: "2021",
    rider: "Samuel W.",
    purpose: "Reliable town transport and small business deliveries",
    verification: "Paperwork documented and key handed over",
    town: "Juja Road Yard",
  },
];

export function RecentDeliveries() {
  return (
    <section className="border-t border-mist-200 bg-white py-14 sm:py-18">
      <div className="container-page">
        <SectionHeading
          eyebrow="Trusted in Nairobi"
          title="Recent deliveries and key handovers"
          description="Boda boda riders, delivery couriers, and commuters who found their reliable motorcycle at our Juja Road yard in Eastleigh."
          action={{ href: "/bikes", label: "Browse current stock" }}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT_DELIVERIES.map((item) => (
            <div
              key={item.model + item.rider}
              className="flex flex-col justify-between rounded-2xl border border-mist-200 bg-mist-50/60 p-5 transition-all hover:border-mist-300 hover:shadow-card hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    <KeyRound className="size-3 text-emerald-700" />
                    Handed Over
                  </span>
                  <span className="text-[11px] font-semibold text-mist-500">{item.year}</span>
                </div>

                <h3 className="mt-3 font-extrabold text-base text-ink-900 leading-snug">
                  {item.model}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-accent-700">
                  Buyer: {item.rider}
                </p>

                <p className="mt-2.5 text-xs text-mist-600 leading-relaxed">
                  {item.purpose}
                </p>
              </div>

              <div className="mt-4 border-t border-mist-200/80 pt-3">
                <div className="flex items-start gap-1.5 text-[11px] font-medium text-emerald-800">
                  <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-600 shrink-0" />
                  <span>{item.verification}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-mist-500">
                  <MapPin className="size-3 text-mist-400 shrink-0" />
                  <span>{item.town}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dealership Promise Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-mist-200 bg-ink-950 p-6 text-white sm:flex-row sm:p-7">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-600 text-white shadow-sm">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                Physical inspection before any payment
              </h4>
              <p className="text-xs text-white/70 mt-0.5">
                Every bike is test-ridden and verified with original paperwork at our Juja Road yard in Eastleigh.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink-950 hover:bg-mist-100 transition-colors"
          >
            <span>Visit our yard today</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
