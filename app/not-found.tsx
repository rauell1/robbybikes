import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FavoritesProvider } from "@/components/bikes/favorites-context";
import { FavoritesModal } from "@/components/bikes/favorites-modal";
import { buttonStyles } from "@/components/ui/button";
import { business } from "@/lib/business";
import { telHref } from "@/lib/contact";

export default function NotFound() {
  return (
    <FavoritesProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center">
          <div className="container-page flex flex-col items-center py-20 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-mist-100 text-mist-500">
              <Compass className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              404: page not found
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
              We could not find that page
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-600">
              The link may be out of date. Browse the motorcycles currently listed, or contact the
              dealership and we will point you in the right direction.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/bikes" className={buttonStyles({ variant: "primary" })}>
                Browse bikes
              </Link>
              <Link href="/" className={buttonStyles({ variant: "outline" })}>
                Go to homepage
              </Link>
              <a href={telHref(business.phones[0].international)} className={buttonStyles({ variant: "ghost" })}>
                Call {business.phones[0].display}
              </a>
            </div>
          </div>
        </main>
        <SiteFooter />
        <FavoritesModal />
      </div>
    </FavoritesProvider>
  );
}
