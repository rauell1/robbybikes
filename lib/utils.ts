import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, taken: string[]): string {
  const root = slugify(base) || "listing";
  if (!taken.includes(root)) return root;
  let counter = 2;
  while (taken.includes(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}

export function truncate(value: string, max = 160): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("254")) {
    return `0${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return value;
}

/** Accepts 07…, 01…, 254…, +254… and returns +2547XXXXXXXX. */
export function normalisePhone(value: string): string | null {
  const digits = value.replace(/[^\d]/g, "");
  let local: string | null = null;
  if (digits.length === 12 && digits.startsWith("254")) local = digits.slice(3);
  else if (digits.length === 10 && digits.startsWith("0")) local = digits.slice(1);
  else if (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) local = digits;
  if (!local || !/^[71]\d{8}$/.test(local)) return null;
  return `+254${local}`;
}

export function toSafeInt(value: string | undefined | null): number | undefined {
  if (value === undefined || value === null || value.trim() === "") return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : undefined;
}
