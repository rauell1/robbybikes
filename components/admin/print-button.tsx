"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg bg-ink-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-ink-800 transition-colors cursor-pointer"
    >
      <Printer className="size-3.5" />
      <span>Print now</span>
    </button>
  );
}
