import type { Metadata, Viewport } from "next";
import { Caudex, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { cookies } from "next/headers";
import { SaintReveal, WelcomeReveal } from "@/components/saint-reveal";
import { currentUser } from "@/lib/auth";
import { currentInviter } from "@/lib/invite";
import { saint, WELCOME_SAINT } from "@/lib/saints";
import "./globals.css";

const heading = Caudex({ variable: "--font-heading", subsets: ["latin"], weight: ["400", "700"] });
const body = Nunito_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://fiat.anselmlong.com"),
  title: { default: "Fiat — Give my heart", template: "%s · Fiat" },
  description:
    "Not everyone can give money. Everyone can give something. Offer your time, your gifts and your prayers to Catholic organisations in Singapore.",
  applicationName: "Fiat",
  appleWebApp: { capable: true, title: "Fiat", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#4e2984" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();
  // A visitor who arrived on a friend's invite link meets a saint before anything else, once.
  const inviter = !user && !(await cookies()).get("fiat_welcomed") ? await currentInviter() : null;
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
        <SaintReveal enabled={user?.role === "supporter"} />
        {inviter && <WelcomeReveal inviterName={inviter.firstName} saint={saint(WELCOME_SAINT)!} />}
      </body>
    </html>
  );
}
