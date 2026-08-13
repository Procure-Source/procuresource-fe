import StaticPage from "@/components/common/StaticPage";
import { staticPages } from "@/lib/content";
import { createStaticPageMetadata } from "@/lib/static-page-metadata";

export const metadata = createStaticPageMetadata("privacy");

export default function PrivacyPage() {
  return <StaticPage page={staticPages.privacy} />;
}
