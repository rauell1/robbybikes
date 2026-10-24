"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  altText: string | null;
};

type Props = {
  images: GalleryPhoto[];
  title: string;
  /** Demo listings show illustrative photos that are not dealership stock. */
  isSample?: boolean;
};

export function BikeGallery({ images, title, isSample = false }: Props) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const current = images[active];

  const step = useCallback(
    (direction: 1 | -1) => {
      setActive((index) => (count === 0 ? 0 : (index + direction + count) % count));
    },
    [count],
  );

  useEffect(() => {
    if (!expanded) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [expanded, step]);

  if (!current) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-card border border-dashed border-mist-300 bg-mist-50 text-sm text-mist-500">
        Photos for this motorcycle will be added soon.
      </div>
    );
  }

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-card bg-mist-100">
        <Image
          key={current.id}
          src={current.imageUrl}
          alt={current.altText ?? title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        {isSample ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-50/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900 shadow-card">
            Sample photo
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-ink-950/80 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Expand aria-hidden className="size-4" />
          View full screen
        </button>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-card transition hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 group-hover:opacity-100"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-card transition hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 group-hover:opacity-100"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Photo thumbnails">
          {images.map((photo, index) => (
            <li key={photo.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1} of ${count}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "relative size-20 overflow-hidden rounded-md border-2 transition",
                  index === active
                    ? "border-accent-500 ring-2 ring-accent-500/20"
                    : "border-transparent hover:border-mist-300",
                )}
              >
                <Image src={photo.imageUrl} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-50 flex flex-col bg-ink-950"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm font-medium">
              {active + 1} / {count}
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X aria-hidden className="size-5" />
              Close
            </button>
          </div>

          <div className="relative mx-4 mb-4 flex-1 overflow-hidden rounded-lg bg-black">
            <Image
              src={current.imageUrl}
              alt={current.altText ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 ? (
            <div className="flex items-center justify-center gap-4 pb-6">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronLeft aria-hidden className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <ChevronRight aria-hidden className="size-6" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
