"use client";

import { ProductErrorScreen } from "@/components/product/product-state-shells";

export default function AdminDashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ProductErrorScreen
      reset={reset}
      variant="dashboard"
      title="The verification dashboard could not load."
      message="Try again, or return to the dashboard."
      backHref="/admin/dashboard"
      backLabel="Verification dashboard"
    />
  );
}
