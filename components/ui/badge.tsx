import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "available" | "reserved" | "pending" | "sold" | "neutral" | "accent" | "sample";

const TONES: Record<Tone, string> = {
  available: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  reserved: "bg-amber-50 text-amber-900 ring-amber-600/25",
  pending: "bg-orange-50 text-orange-900 ring-orange-600/25",
  sold: "bg-mist-100 text-mist-600 ring-mist-400/30",
  neutral: "bg-mist-100 text-ink-700 ring-mist-300",
  accent: "bg-accent-50 text-accent-800 ring-accent-600/20",
  sample: "bg-ink-900/85 text-white ring-white/20 backdrop-blur",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
