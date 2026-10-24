"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/bikes/favorites-context";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function SaveBikeButton({ bike }: { bike: MotorcycleWithImages }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(bike.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(bike)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
        favorite
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-mist-200 text-mist-600 hover:border-mist-300 hover:bg-mist-50 hover:text-ink-900",
      )}
      aria-label={favorite ? `Remove ${bike.model} from saved` : `Save ${bike.model}`}
    >
      <Heart className={cn("size-3.5", favorite && "fill-red-600 text-red-600")} />
      <span>{favorite ? "Saved in shortlist" : "Save to shortlist"}</span>
    </button>
  );
}
