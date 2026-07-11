import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("faq");

export default function FAQPage() {
  return <LaunchPage pageKey="faq" />;
}
