"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { business } from "@/lib/business";
import { telHref } from "@/lib/contact";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page error", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-amber-700">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">
        We could not load this page
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-600">
        Something went wrong on our side. You can try again, browse the inventory, or call the
        dealership directly.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={reset} className={buttonStyles({ variant: "dark" })}>
          Try again
        </button>
        <Link href="/bikes" className={buttonStyles({ variant: "outline" })}>
          Browse bikes
        </Link>
        <a href={telHref(business.phones[0].international)} className={buttonStyles({ variant: "ghost" })}>
          Call {business.phones[0].display}
        </a>
      </div>
    </div>
  );
}
