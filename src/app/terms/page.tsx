import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("terms");

export default function TermsPage() {
  return <LaunchPage pageKey="terms" />;
}
