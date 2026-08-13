import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StructuredData from "@/components/common/StructuredData";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ProcureSource — RFQ software for UAE MEP procurement managers",
    template: "%s | ProcureSource",
  },
  description: siteConfig.description,
  keywords: [
    "ProcureSource",
    "UAE MEP RFQ",
    "MEP RFQ platform",
    "MEP procurement",
    "UAE procurement",
    "Dubai MEP procurement",
    "construction procurement UAE",
    "GCC MEP news",
    "Dubai construction procurement",
    "UAE facilities management news",
    "GCC utilities news",
    "MEP policy updates UAE",
    "international MEP news",
    "Dubai to the world procurement",
    "Grow Technology Services FZ LLC",
    "MEP tendering",
    "coming soon",
    "private build",
    "Dubai",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  applicationName: siteConfig.name,
  category: "Private launch",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "ProcureSource | UAE MEP RFQ Platform",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: ["ar_AE"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ProcureSource | UAE MEP RFQ Platform",
    description: "A UAE-first MEP RFQ platform for project procurement teams.",
  },
  icons: {
    icon: [{ url: "/procuresource-logo-mark.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "AE-DU",
    "geo.placename": "Dubai",
    "geo.position": "25.2048;55.2708",
    ICBM: "25.2048, 55.2708",
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
        <StructuredData />
        <GoogleAnalytics gaId="G-LB6GXR1EZM" />
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
