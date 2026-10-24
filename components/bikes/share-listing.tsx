"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareListing({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title, text: title, url });
        return;
      }
    } catch {
      // User cancelled or sharing unsupported: fall through to copy.
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link to share the listing:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 transition-colors hover:text-accent-700"
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
      {copied ? "Link copied" : "Share listing"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Listing link copied to clipboard" : ""}
      </span>
    </button>
  );
}
