import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function AdminBikeNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-mist-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-ink-900">Listing not found</h2>
      <p className="mt-1 text-sm text-mist-600">
        This motorcycle may have been deleted, or the link is incorrect.
      </p>
      <Link href="/admin/bikes" className={`${buttonStyles({ variant: "dark" })} mt-4`}>
        Back to inventory
      </Link>
    </div>
  );
}
