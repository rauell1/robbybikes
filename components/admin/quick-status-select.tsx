"use client";

import { useTransition } from "react";
import { setBikeStatusAction } from "@/lib/actions/admin-bike-actions";
import { MotorcycleStatus } from "@/lib/db/schema";
import { STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  bikeId: string;
  currentStatus: MotorcycleStatus;
  className?: string;
};

const STATUS_COLORS: Record<MotorcycleStatus, { bg: string; text: string; dot: string }> = {
  available: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
  reserved: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  pending_sale: { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
  sold: { bg: "bg-mist-100 border-mist-300", text: "text-mist-700", dot: "bg-mist-400" },
};

export function QuickStatusSelect({ bikeId, currentStatus, className }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    const formData = new FormData();
    formData.append("id", bikeId);
    formData.append("status", nextStatus);

    startTransition(async () => {
      await setBikeStatusAction(formData);
    });
  };

  const style = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.available;

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <span
        className={cn(
          "pointer-events-none absolute left-2.5 size-2 rounded-full",
          style.dot,
          isPending && "animate-ping",
        )}
      />
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Change motorcycle availability status"
        className={cn(
          "h-8 rounded-lg border pl-6 pr-6 text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500",
          style.bg,
          style.text,
          isPending && "opacity-60 cursor-wait",
        )}
      >
        {(["available", "reserved", "pending_sale", "sold"] as const).map((status) => (
          <option key={status} value={status} className="bg-white text-ink-900 font-medium">
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
