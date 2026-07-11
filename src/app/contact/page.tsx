import { LaunchPage } from "@/components/launch/launch-page";
import { createLaunchMetadata } from "@/lib/launch-metadata";

export const metadata = createLaunchMetadata("contact");

export default function ContactPage() {
  return <LaunchPage pageKey="contact" />;
}
