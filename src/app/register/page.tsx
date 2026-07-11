import type { Metadata } from "next";

import { ProductAuthFlow } from "@/components/product/auth-flow";
import { ProductShell } from "@/components/product/product-shell";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a ProcureSource account as a purchaser or supplier.",
};

export default function RegisterPage() {
  return (
    <ProductShell showFooter={false}>
      <ProductAuthFlow mode="register" />
    </ProductShell>
  );
}
