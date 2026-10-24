import { BikeCard } from "@/components/bikes/bike-card";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function BikeGrid({
  bikes,
  className,
  priorityCount = 0,
}: {
  bikes: MotorcycleWithImages[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {bikes.map((bike, index) => (
        <BikeCard key={bike.id} bike={bike} priority={index < priorityCount} />
      ))}
    </div>
  );
}
