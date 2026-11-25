import { redirect } from "next/navigation";

import { cleanSource } from "@/lib/onboarding";

/* Only suppliers are onboarded now; keep any QR source tag on the way through. */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string | string[] }>;
}) {
  const source = cleanSource((await searchParams).source);
  redirect(
    source === "direct" ? "/onboarding/supplier" : `/onboarding/supplier?source=${source}`,
  );
}
