import type { Metadata } from "next";

import { ProductAuthFlow } from "@/components/product/auth-flow";
import { ProductShell } from "@/components/product/product-shell";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to ProcureSource as a purchaser or supplier.",
};

export default function LoginPage() {
  return (
    <ProductShell showFooter={false}>
      <ProductAuthFlow mode="login" />
    </ProductShell>
  );
}
