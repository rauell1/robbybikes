import Image from "next/image";
import { Bike } from "lucide-react";
import type { MotorcycleImage } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type BikePhotoProps = {
  image?: Pick<MotorcycleImage, "imageUrl" | "altText"> | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackLabel?: string;
};

export function BikePhoto({
  image,
  alt,
  sizes,
  priority = false,
  className,
  fallbackLabel,
}: BikePhotoProps) {
  if (!image) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-mist-100 text-mist-500",
          className,
        )}
        role="img"
        aria-label={fallbackLabel ?? "No photograph provided"}
      >
        <Bike className="size-10" aria-hidden="true" />
        <span className="px-4 text-center text-xs font-medium">Photo coming soon</span>
      </div>
    );
  }

  return (
    <Image
      src={image.imageUrl}
      alt={image.altText || alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
