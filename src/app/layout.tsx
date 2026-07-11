import type { Metadata } from "next";
import "./globals.css";

import StructuredData from "@/components/seo/structured-data";
import { GoogleAnalytics } from '@next/third-parties/google';


export const metadata: Metadata = {
  title: {
    default: "ProcureSource - UAE MEP RFQ Workspace",
    template: "%s | ProcureSource",
  },
  description: "ProcureSource is a UAE-first MEP RFQ workspace for BOQ upload, supplier quote links, quote comparison, and award export.",
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
    "BOQ reading",
    "supplier quote links",
    "quote comparison",
    "Dubai",
  ],
  authors: [{ name: "Grow Technology Services FZ LLC" }],
  creator: "Grow Technology Services FZ LLC",
  publisher: "Grow Technology Services FZ LLC",
  applicationName: "ProcureSource",
  category: "Procurement software",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://procuresource.co"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "ProcureSource - UAE MEP RFQ Workspace",
    description: "A UAE-first MEP RFQ workspace for contractors, consultants, suppliers, and project procurement teams.",
    url: "https://procuresource.co",
    siteName: "ProcureSource",
    locale: "en_US",
    alternateLocale: ["ar_AE"],
    type: "website",
    images: [
      {
        url: "/procuresource-og.png",
        width: 1200,
        height: 630,
        alt: "ProcureSource UAE MEP RFQ workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProcureSource - UAE MEP RFQ Workspace",
    description: "A UAE-first MEP RFQ workspace for project procurement teams.",
    images: ["/procuresource-og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/procuresource-logo-mark.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
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
    "google-site-verification": "googleedab61857739b0a0",
    "geo.region": "AE-DU",
    "geo.placename": "Dubai",
    "geo.position": "25.2048;55.2708",
    ICBM: "25.2048, 55.2708",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <StructuredData />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
      <GoogleAnalytics gaId="G-LB6GXR1EZM" />
    </html>
  );
}
