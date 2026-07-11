import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("status");

export default function StatusPage() {
  return <LaunchPage pageKey="status" />;
}
