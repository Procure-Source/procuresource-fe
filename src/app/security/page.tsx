import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("security");

export default function SecurityPage() {
  return <LaunchPage pageKey="security" />;
}
