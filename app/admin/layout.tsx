import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Robbybikes admin",
    template: "%s | Robbybikes admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-mist-50">{children}</div>;
}
