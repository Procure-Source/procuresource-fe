import type { Metadata } from "next";

import ProcurementTransformationInspector from "@/components/ProcurementTransformationInspector";

export const metadata: Metadata = {
  title: "Procurement Transformation Prototype",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProcurementTransformationDevPage() {
  return (
    <div className="bg-paper px-gutter py-12 text-ink">
      <div className="mx-auto max-w-page">
        <ProcurementTransformationInspector />
      </div>
    </div>
  );
}
