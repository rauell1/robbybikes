import type { EnquiryStatus, MotorcycleCondition, MotorcycleStatus } from "@/lib/db/schema";

const numberFormatter = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

/** Consistent price presentation: KSh 125,000 */
export function formatKes(amount: number): string {
  return `KSh ${numberFormatter.format(amount)}`;
}

export function formatPriceFrom(amount: number): string {
  return `From ${formatKes(amount)}`;
}

export function formatEngine(cc: number | null | undefined): string | null {
  if (!cc) return null;
  return `${cc.toLocaleString("en-KE")} cc`;
}

export function formatOdometer(km: number | null | undefined): string | null {
  if (km === null || km === undefined) return null;
  return `${km.toLocaleString("en-KE")} km`;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const CONDITION_LABELS: Record<MotorcycleCondition, string> = {
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  needs_repair: "Needs repair",
};

export function conditionLabel(value: MotorcycleCondition | null | undefined): string {
  if (!value) return "Not provided";
  return CONDITION_LABELS[value];
}

export const STATUS_LABELS: Record<MotorcycleStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  pending_sale: "Pending sale",
  sold: "Sold",
};

export type StatusTone = "available" | "reserved" | "pending" | "sold";

export function statusMeta(status: MotorcycleStatus): {
  label: string;
  tone: StatusTone;
  description: string;
} {
  switch (status) {
    case "available":
      return {
        label: STATUS_LABELS.available,
        tone: "available",
        description: "In stock and open to viewings.",
      };
    case "reserved":
      return {
        label: STATUS_LABELS.reserved,
        tone: "reserved",
        description: "On hold for a buyer. Ask us about similar stock.",
      };
    case "pending_sale":
      return {
        label: STATUS_LABELS.pending_sale,
        tone: "pending",
        description: "A sale is in progress. Availability is not guaranteed.",
      };
    case "sold":
      return {
        label: STATUS_LABELS.sold,
        tone: "sold",
        description: "This motorcycle has been sold.",
      };
  }
}

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  closed: "Closed",
};

export const CONTACT_METHOD_LABELS: Record<string, string> = {
  phone: "Phone call",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

export function contactMethodLabel(value: string): string {
  return CONTACT_METHOD_LABELS[value] ?? value;
}
