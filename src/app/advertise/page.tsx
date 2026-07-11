import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("advertise");

export default function AdvertisePage() {
  return <LaunchPage pageKey="advertise" />;
}
