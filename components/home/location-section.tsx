"use client";

import { useState } from "react";
import {
  Bus,
  Car,
  Check,
  Clock,
  Copy,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { business, directionsNote, mapsDirectionsUrl, mapsSearchUrl } from "@/lib/business";
import { telHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

const TRANSIT_TABS = [
  {
    id: "matatu",
    label: "From CBD (Matatu)",
    icon: Bus,
    instructions:
      "Board Matatu Route 4 or 6 from OTC / Odeon stage in Nairobi CBD heading towards Eastleigh Juja Road. Alight at the Amana / Luqman Petrol Station stage. The Robbybikes yard is right adjacent.",
  },
  {
    id: "car",
    label: "By Car / Boda Boda",
    icon: Car,
    instructions:
      "Drive down Juja Road towards Eastleigh. Once you approach the Amana / Luqman Petrol Station junction, look for the yard entrance. Free customer parking is available inside the compound.",
  },
  {
    id: "thika",
    label: "From Thika Rd / Pangani",
    icon: Navigation,
    instructions:
      "From Pangani interchange or Murang'a Road, branch off onto Juja Road heading east towards Eastleigh. It is a direct 5-10 minute ride directly to the Luqman / Amana landmark.",
  },
] as const;

export function LocationSection() {
  const [activeTab, setActiveTab] = useState<string>("matatu");
  const [copied, setCopied] = useState(false);

  const currentTab = TRANSIT_TABS.find((t) => t.id === activeTab) ?? TRANSIT_TABS[0];

  const copyAddress = () => {
    navigator.clipboard.writeText(
      `${business.name}, ${business.address.street}, ${business.address.area}, Nairobi (Near Amana / Luqman Petrol Station)`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-card lg:grid-cols-5">
      <div className="p-6 sm:p-8 lg:col-span-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">
          Visit the physical yard
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Find us on Juja Road, Eastleigh
        </h2>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-mist-600">{directionsNote}</p>

        {/* Interactive Transit Directions Tabs */}
        <div className="mt-5 rounded-xl border border-mist-200 bg-mist-50 p-4">
          <div className="flex flex-wrap gap-1.5 border-b border-mist-200 pb-3">
            {TRANSIT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-ink-950 text-white shadow-xs"
                      : "bg-white text-mist-600 hover:bg-mist-200"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-800 font-medium">
            {currentTab.instructions}
          </p>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-mist-500">Address</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                {business.address.street}, {business.address.area}
                <br />
                {business.address.city}, {business.address.country}
              </dd>
              <button
                type="button"
                onClick={copyAddress}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-700 hover:text-accent-800"
              >
                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                <span>{copied ? "Address copied to clipboard!" : "Copy address"}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-mist-500">
                Call Before Traveling
              </dt>
              <dd className="mt-0.5 space-y-0.5 text-sm font-semibold text-ink-900">
                {business.phones.map((phone) => (
                  <a
                    key={phone.international}
                    href={telHref(phone.international)}
                    className="block hover:text-accent-700"
                  >
                    {phone.display}
                  </a>
                ))}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles({ variant: "dark" }),
              "justify-center rounded-xl font-bold shadow-md",
            )}
          >
            <Navigation className="size-4" aria-hidden="true" />
            <span>Open in Google Maps</span>
          </a>
          <a
            href={telHref(business.phones[0].international)}
            className={cn(
              buttonStyles({ variant: "outline" }),
              "justify-center rounded-xl font-semibold",
            )}
          >
            <Phone className="size-4" aria-hidden="true" />
            <span>Call Yard: {business.phones[0].display}</span>
          </a>
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden bg-ink-950 p-6 text-white sm:p-8 lg:col-span-2">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent-500 text-white shadow-glow">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xl font-extrabold tracking-tight">{business.address.shortDisplay}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Landmark: <strong>{business.address.landmark}</strong>. If traffic is heavy on the Juja
            Road junction, give us a call and we will direct you to the entrance.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <ShieldCheck className="size-5 shrink-0 text-accent-400" />
            <p className="text-xs text-white/80">
              Free on-site inspection & cold start testing with our mechanics.
            </p>
          </div>
        </div>

        <div className="relative mt-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-accent-300">
            Fraud Prevention Notice
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/75">
            Never send M-Pesa deposits or booking fees to any number before inspecting the bike
            physically at our Eastleigh yard.
          </p>
        </div>
      </div>
    </div>
  );
}
