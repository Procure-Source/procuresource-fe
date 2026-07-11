import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("about");

export default function AboutPage() {
  return <LaunchPage pageKey="about" />;
}
