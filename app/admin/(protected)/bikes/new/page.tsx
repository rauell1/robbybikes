import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BikeForm } from "@/components/admin/bike-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Add motorcycle" };

export default async function NewBikePage() {
  await requireAdmin("/admin/bikes/new");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/bikes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to inventory
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">Add a motorcycle</h1>
        <p className="mt-1 max-w-2xl text-sm text-mist-600">
          Create the listing first, then add photographs. New listings are saved as drafts until you
          tick &ldquo;Published on the website&rdquo;.
        </p>
      </div>

      <BikeForm mode="create" />
    </div>
  );
}
