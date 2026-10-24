"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { business } from "@/lib/business";
import { formatKes } from "@/lib/format";
import { whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";

type Props = {
  brand: string;
  model: string;
  priceKes: number;
  engineCc: number | null;
  year: number | null;
  listingUrl: string;
};

const INTENT_OPTIONS = [
  {
    id: "inspect",
    label: "📅 Inspect in yard today",
    lead: "I would like to come to your Juja Road yard in Eastleigh to physically inspect and test this bike today. What time is best?",
  },
  {
    id: "avail",
    label: "✅ Check if in stock",
    lead: "Is this bike still available in the yard, or has a deposit been placed on it?",
  },
  {
    id: "logbook",
    label: "📄 Logbook & paperwork",
    lead: "Could you please confirm if the logbook is ready for immediate transfer at NTSA upon purchase?",
  },
  {
    id: "offer",
    label: "💰 Best cash price",
    lead: "I am a serious ready cash buyer. What is your best final price if I pay and take it today?",
  },
  {
    id: "video",
    label: "🎥 Walkaround clip",
    lead: "Could you send me a short 30-second WhatsApp video of the engine running and cold start?",
  },
] as const;

export function WhatsAppBuilder({
  brand,
  model,
  priceKes,
  engineCc,
  year,
  listingUrl,
}: Props) {
  const [selectedIntent, setSelectedIntent] = useState<string>("inspect");

  const generatedMessage = useMemo(() => {
    const intent =
      INTENT_OPTIONS.find((opt) => opt.id === selectedIntent) ?? INTENT_OPTIONS[0];

    const specsText = [
      year ? `Year: ${year}` : null,
      engineCc ? `Engine: ${engineCc}cc` : null,
      `Listed price: ${formatKes(priceKes)}`,
    ]
      .filter(Boolean)
      .join(" · ");

    return `Hello ${business.name},\n\nI am interested in the *${brand} ${model}* (${specsText}).\n\n${intent.lead}\n\nListing link: ${listingUrl}`;
  }, [brand, model, priceKes, engineCc, year, listingUrl, selectedIntent]);

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-xl bg-whatsapp/15 text-whatsapp-dark">
          <MessageSquare className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-ink-900">
            Enquire directly on WhatsApp
          </h3>
          <p className="text-xs text-mist-500">
            Choose what you want to ask: your message will be pre-filled automatically
          </p>
        </div>
      </div>

      {/* Intent Quick Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {INTENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedIntent(opt.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedIntent === opt.id
                ? "bg-ink-950 text-white shadow-xs"
                : "border border-mist-200 bg-mist-50 text-ink-700 hover:bg-mist-100 hover:border-mist-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Message Preview Box */}
      <div className="relative mt-4 rounded-xl border border-mist-200 bg-mist-50/70 p-3.5 text-xs font-mono text-ink-800 leading-relaxed">
        <span className="absolute -top-2.5 left-3 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-mist-500 uppercase tracking-wider border border-mist-200">
          Message preview
        </span>
        <p className="whitespace-pre-line pt-1">{generatedMessage}</p>
      </div>

      {/* Big Action Button */}
      <div className="mt-4">
        <a
          href={whatsappHref(generatedMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("contact_whatsapp", { context: `intent_${selectedIntent}` })}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 text-sm font-bold text-white shadow-green-glow transition-all hover:bg-whatsapp-dark hover:scale-[1.01] active:scale-98"
        >
          <WhatsAppIcon className="size-5" />
          <span>Send Message via WhatsApp</span>
        </a>
        <p className="mt-2 text-center text-[11px] text-mist-500">
          Chat with the yard team at {business.phones[0].display} · Typically replies in minutes
        </p>
      </div>
    </div>
  );
}
