import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("access");

export default function AccessPage() {
  return <LaunchPage pageKey="access" />;
}
