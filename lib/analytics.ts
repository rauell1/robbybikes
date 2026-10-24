"use client";

/**
 * Privacy-friendly conversion events.
 *
 * Events are pushed to `window.dataLayer` only. No analytics vendor is loaded
 * and no personal data is included. If the owner later connects Google
 * Analytics or another tag manager, they can read these events after
 * reviewing their consent obligations under the Kenya Data Protection Act.
 */
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...params });
  } catch {
    // Analytics must never break the interface.
  }
}

export function trackContactClick(channel: "whatsapp" | "phone" | "directions", context: string): void {
  trackEvent(`contact_${channel}`, { context });
}
