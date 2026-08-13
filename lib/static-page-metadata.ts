import type { Metadata } from "next";

import { staticPages, type StaticPageKey } from "@/lib/content";

export function createStaticPageMetadata(pageKey: StaticPageKey): Metadata {
  const page = staticPages[pageKey];

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.href },
    openGraph: {
      title: `${page.metaTitle} | ProcureSource`,
      description: page.metaDescription,
      url: page.href,
    },
    twitter: {
      card: "summary",
      title: `${page.metaTitle} | ProcureSource`,
      description: page.metaDescription,
    },
  };
}
