import type { Metadata, Viewport } from "next";
import { Caudex, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const heading = Caudex({ variable: "--font-heading", subsets: ["latin"], weight: ["400", "700"] });
const body = Nunito_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Fiat — Give my heart", template: "%s · Fiat" },
  description:
    "Not everyone can give money. Everyone can give something. Offer your time, your skills and your prayers to Catholic organisations in Singapore.",
  applicationName: "Fiat",
  appleWebApp: { capable: true, title: "Fiat", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#4e2984" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-gold">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
