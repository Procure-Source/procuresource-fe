import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

import "./globals.css";

/*
  Fonts: Newsreader (display) + IBM Plex Sans (body/UI).
  next/font self-hosts these as woff2 and emits a size-adjusted local fallback,
  so there is no third-party connection and no swap reflow — this is the
  production setup the static build left as a TODO.
*/
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-newsreader",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-sans",
});

const title = "ProcureSource — RFQ software for UAE MEP procurement managers";
/* These mirror the hero copy — keep them in step with it. */
const description =
  "Convert your BOQ into a shareable link. ProcureSource gives UAE MEP procurement managers one link to send to every supplier, and brings every quote back into a single comparison table.";
const socialDescription =
  "Convert your BOQ into a shareable link. Your suppliers submit line-by-line quotes directly into a single comparison table.";

/* TODO: point metadataBase at the production URL and add an og:image (1200x630)
   in app/opengraph-image.png once the domain is live. */
export const metadata: Metadata = {
  metadataBase: new URL("https://procuresource.ae"),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "ProcureSource",
    locale: "en_AE",
    url: "/",
    title,
    description: socialDescription,
  },
  twitter: {
    card: "summary",
    title,
    description: socialDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable}`}>
      <body>
        {/* Parked far off-screen until focused — the one place an arbitrary
            offset beats the scale. */}
        <a
          className="absolute top-0 -left-[9999px] z-100 bg-accent px-4 py-2.5 text-small text-paper no-underline focus:top-2 focus:left-2"
          href="#main"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}
