"use client";

import { ProductErrorScreen } from "@/components/product/product-state-shells";

export default function PurchaserDashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ProductErrorScreen
      reset={reset}
      variant="dashboard"
      title="The purchaser dashboard could not load."
      message="Try again, or return to the dashboard."
      backHref="/pm/dashboard"
      backLabel="Purchaser dashboard"
    />
  );
}
