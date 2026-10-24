import Link from "next/link";
import { ExternalLink, LogOut, Store } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { describeDatabase } from "@/lib/db";
import { business } from "@/lib/business";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const driverLabel = describeDatabase().label;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col border-b border-ink-800 bg-ink-950 text-white lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-white text-ink-950">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">Robbybikes</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-white/45">
                Admin console
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-md p-2 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="View public website"
          >
            <ExternalLink className="size-4" />
          </Link>
        </div>

        <AdminNav />

        <div className="mt-auto hidden border-t border-white/10 p-3 lg:block">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View public site
          </Link>
          <div className="mt-2 rounded-lg bg-white/5 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-white/80">{session.name ?? session.email}</p>
            <p className="truncate text-[11px] text-white/45">{session.email}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">
              {session.role} · {driverLabel}
            </p>
          </div>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-mist-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm text-mist-600">
            <span className="font-semibold text-ink-900">{business.name}</span> stock and enquiries
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-mist-500 sm:inline">{session.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-mist-300 px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-mist-50"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
