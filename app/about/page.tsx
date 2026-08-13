import StaticPage from "@/components/common/StaticPage";
import { staticPages } from "@/lib/content";
import { createStaticPageMetadata } from "@/lib/static-page-metadata";

export const metadata = createStaticPageMetadata("about");

export default function AboutPage() {
  return <StaticPage page={staticPages.about} />;
}
