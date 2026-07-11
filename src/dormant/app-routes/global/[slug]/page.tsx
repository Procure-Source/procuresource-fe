import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FooterLandingPage from "@/components/footer-landing-page";
import { findFooterPage, globalPages } from "@/lib/footer-pages";

type GlobalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return globalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: GlobalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findFooterPage(globalPages, slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.subtitle,
    alternates: {
      canonical: `/global/${page.slug}`,
    },
  };
}

export default async function GlobalPage({ params }: GlobalPageProps) {
  const { slug } = await params;
  const page = findFooterPage(globalPages, slug);

  if (!page) {
    notFound();
  }

  return <FooterLandingPage page={page} />;
}
