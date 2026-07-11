import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FooterLandingPage from "@/components/footer-landing-page";
import { findFooterPage, marketPages } from "@/lib/footer-pages";

type MarketPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return marketPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findFooterPage(marketPages, slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.subtitle,
    alternates: {
      canonical: `/markets/${page.slug}`,
    },
  };
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { slug } = await params;
  const page = findFooterPage(marketPages, slug);

  if (!page) {
    notFound();
  }

  return <FooterLandingPage page={page} />;
}
