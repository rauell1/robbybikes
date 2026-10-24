import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { MobileContactBar } from "@/components/site/mobile-contact-bar";
import { CompareProvider } from "@/components/bikes/compare-context";
import { FavoritesProvider } from "@/components/bikes/favorites-context";
import { FavoritesModal } from "@/components/bikes/favorites-modal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <CompareProvider>
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppFab />
          <MobileContactBar />
          <FavoritesModal />
        </div>
      </CompareProvider>
    </FavoritesProvider>
  );
}
