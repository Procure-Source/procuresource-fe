import type { Metadata } from "next";

import { launchPages, type LaunchPageKey } from "./launch-content";

export function createLaunchMetadata(pageKey: LaunchPageKey): Metadata {
  const page = launchPages[pageKey];

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.href },
    openGraph: {
      title: `${page.metaTitle} | ProcureSource`,
      description: page.metaDescription,
      url: page.href,
      images: [
        {
          url: "/procuresource-og.png",
          width: 1200,
          height: 630,
          alt: "ProcureSource UAE MEP RFQ platform launch",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.metaTitle} | ProcureSource`,
      description: page.metaDescription,
      images: ["/procuresource-og.png"],
    },
  };
}
