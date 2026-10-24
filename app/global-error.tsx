"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en-KE">
      <body className="flex min-h-screen items-center justify-center bg-mist-50 p-6 font-sans antialiased text-ink-900">
        <div className="w-full max-w-md rounded-2xl border border-mist-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-ink-900">
            Application temporarily unavailable
          </h1>
          <p className="mt-2 text-sm text-mist-600 leading-relaxed">
            We encountered an unexpected issue while loading the application. Please try reloading
            the page.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-xl bg-ink-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-ink-800 transition-colors"
            >
              Reload application
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-mist-300 bg-white px-5 py-2.5 text-xs font-semibold text-ink-900 hover:bg-mist-50 transition-colors"
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
