"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-mist-600">
        The admin action failed. Check the database configuration and try again.
      </p>
      <div className="mt-5">
        <Button onClick={reset} variant="dark">
          Try again
        </Button>
      </div>
    </div>
  );
}
