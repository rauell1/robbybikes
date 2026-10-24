import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function EnquiryNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-mist-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-ink-900">Enquiry not found</h2>
      <p className="mt-1 text-sm text-mist-600">
        This enquiry may have been deleted, or the link is incorrect.
      </p>
      <Link href="/admin/enquiries" className={`${buttonStyles({ variant: "dark" })} mt-4`}>
        Back to enquiries
      </Link>
    </div>
  );
}
