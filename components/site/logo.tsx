import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="Robbybikes home"
    >
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg",
          inverted ? "bg-white text-ink-950" : "bg-ink-950 text-white",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-7" fill="none">
          <path
            d="M8 22.5 15.5 9h4.2L12.2 22.5H8Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path d="M15 22.5 22.5 9H26l-7.5 13.5H15Z" fill="var(--color-accent-500)" />
          <path
            d="M6 26h20"
            stroke="var(--color-accent-500)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[1.15rem] font-extrabold tracking-tight",
            inverted ? "text-white" : "text-ink-900",
          )}
        >
          Robbybikes
        </span>
        <span
          className={cn(
            "mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.18em]",
            inverted ? "text-white/60" : "text-mist-500",
          )}
        >
          Used motorcycles · Nairobi
        </span>
      </span>
    </Link>
  );
}
