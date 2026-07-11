"use client";

import { ProductErrorScreen } from "@/components/product/product-state-shells";

export default function SupplierDashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ProductErrorScreen
      reset={reset}
      variant="dashboard"
      title="The supplier dashboard could not load."
      message="Try again, or return to the dashboard."
      backHref="/supplier/dashboard"
      backLabel="Supplier dashboard"
    />
  );
}
