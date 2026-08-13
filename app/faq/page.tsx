import StaticPage from "@/components/common/StaticPage";
import { FaqStructuredData } from "@/components/common/StructuredData";
import { staticPages } from "@/lib/content";
import { createStaticPageMetadata } from "@/lib/static-page-metadata";

export const metadata = createStaticPageMetadata("faq");

export default function FAQPage() {
  return (
    <>
      <FaqStructuredData />
      <StaticPage page={staticPages.faq} />
    </>
  );
}
