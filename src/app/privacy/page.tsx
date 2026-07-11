import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("privacy");

export default function PrivacyPage() {
  return <LaunchPage pageKey="privacy" />;
}
