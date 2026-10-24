import Link from "next/link";
import { Bike, Search } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export default function BikeNotFound() {
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-mist-100 text-mist-500">
        <Bike className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">
        That motorcycle is no longer listed
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-600">
        The listing may have been sold, unpublished, or the link may be incorrect. Browse current
        stock or ask us what has just arrived.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href="/bikes" className={buttonStyles({ variant: "primary" })}>
          <Search className="size-4" aria-hidden="true" />
          Browse available bikes
        </Link>
        <Link href="/contact" className={buttonStyles({ variant: "outline" })}>
          Contact the dealership
        </Link>
      </div>
    </div>
  );
}
