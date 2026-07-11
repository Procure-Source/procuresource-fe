"use client";

import { ProductErrorScreen } from "@/components/product/product-state-shells";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ProductErrorScreen
      reset={reset}
      title="This product screen could not load."
      message="Try again, or use the flow map to return to the right purchaser, supplier, or verification step."
      backHref="/"
      backLabel="Go home"
    />
  );
}
