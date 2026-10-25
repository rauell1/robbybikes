import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { business } from "@/lib/business";
import { getSiteUrl } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Robbybikes | Used motorcycles for sale in Eastleigh, Nairobi",
    template: "%s | Robbybikes",
  },
  description: business.description,
  applicationName: business.name,
  authors: [{ name: business.legalName }],
  creator: business.legalName,
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: business.name,
    title: "Robbybikes | Used motorcycles in Eastleigh, Nairobi",
    description: business.description,
    url: getSiteUrl(),
    images: [{ url: "/sample/hero.jpg", width: 1376, height: 768, alt: "Motorcycles at a dealership yard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Robbybikes | Used motorcycles in Eastleigh, Nairobi",
    description: business.description,
    images: ["/sample/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
