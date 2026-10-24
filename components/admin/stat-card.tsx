import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "accent" | "warning" | "muted";
};

const TONES = {
  default: "bg-ink-950 text-white",
  accent: "bg-accent-600 text-white",
  warning: "bg-amber-500 text-white",
  muted: "bg-mist-200 text-ink-700",
} as const;

export function StatCard({ label, value, hint, icon: Icon, href, tone = "default" }: StatCardProps) {
  const content = (
    <div className="flex h-full flex-col justify-between rounded-xl border border-mist-200 bg-white p-4 transition-colors hover:border-mist-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">{label}</p>
        <span className={cn("grid size-8 place-items-center rounded-lg", TONES[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-ink-900">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-mist-500">{hint}</p> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-xl focus-visible:outline-none">
        {content}
      </Link>
    );
  }
  return content;
}
