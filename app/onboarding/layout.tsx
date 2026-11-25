import type { Metadata } from "next";

/* Expo QR landing pages: keep them out of search results. */
export const metadata: Metadata = {
  title: "Onboarding",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
