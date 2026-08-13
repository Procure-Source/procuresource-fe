import StaticPage from "@/components/common/StaticPage";
import { staticPages } from "@/lib/content";
import { createStaticPageMetadata } from "@/lib/static-page-metadata";

export const metadata = createStaticPageMetadata("terms");

export default function TermsPage() {
  return <StaticPage page={staticPages.terms} />;
}
