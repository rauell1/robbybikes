import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; loggedOut?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/admin") && !params.next.startsWith("//")
      ? params.next
      : "/admin";

  const demoMode = process.env.DEMO_MODE === "1";
  const demo =
    demoMode && process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD
      ? {
          email: process.env.DEMO_ADMIN_EMAIL,
          password: process.env.DEMO_ADMIN_PASSWORD,
        }
      : undefined;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-6 sm:p-10">
        <Logo />

        <div className="mx-auto w-full max-w-sm py-10">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Administrator sign in</h1>
          <p className="mt-1.5 text-sm text-mist-600">
            Manage motorcycle listings, photos and customer enquiries.
          </p>

          {params.loggedOut ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              You have signed out.
            </p>
          ) : null}

          <div className="mt-6">
            <LoginForm next={next} demo={demo} />
          </div>

          {demo ? (
            <div className="mt-5 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
              <p className="font-semibold">Demo environment</p>
              <p className="mt-1">
                The sign-in form is pre-filled with the demo administrator. These credentials exist
                only because DEMO_MODE is enabled; never enable it on a live deployment.
              </p>
            </div>
          ) : null}

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-mist-500">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden="true" />
            Administrator sessions are signed, expire after 8 hours, and every admin route checks
            authorisation on the server.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-mist-500">
          <Link href="/" className="inline-flex items-center gap-1.5 font-medium hover:text-ink-900">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to website
          </Link>
          <span>© {new Date().getFullYear()} {business.legalName}</span>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(223,95,31,0.55), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-center p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
            Dealership operations
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight text-white">
            Keep the website accurate, one listing at a time.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-white/70">
            {[
              "Add stock, set prices and upload photographs.",
              "Mark bikes reserved, pending sale or sold.",
              "Publish or hide a listing in one click.",
              "Track every customer enquiry and follow-up note.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
