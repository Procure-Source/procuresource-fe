import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wb = XLSX.utils.book_new();

  // Products sheet — one row per product-certification pair
  const templateRows = [
    {
      Brand: "Gulf-O-Flex",
      "Product Category": "HVAC",
      "Product Type": "Insulation",
      "Individual Product": "Pipe Insulation (NBR Elastomeric)",
      "Certification Type": "Fire Test Report",
      "Standard / Code": "ASTM E84 / UL 723 / BS 476",
      "Issuing Authority": "Civil Defence Approved Lab",
      Mandatory: "Yes",
      "Applies In": "UAE",
      Notes: "FSI ≤25 & SDI ≤50",
    },
    {
      Brand: "Gulf-O-Flex",
      "Product Category": "HVAC",
      "Product Type": "Insulation",
      "Individual Product": "Pipe Insulation (NBR Elastomeric)",
      "Certification Type": "Product Conformity Certificate",
      "Standard / Code": "UAE Fire & Life Safety Code 2018",
      "Issuing Authority": "Dubai Municipality (DCLD)",
      Mandatory: "Yes",
      "Applies In": "UAE",
      Notes: "Certificate CL23020867",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);

  ws["!cols"] = [
    { wch: 20 }, // Brand
    { wch: 18 }, // Product Category
    { wch: 15 }, // Product Type
    { wch: 35 }, // Individual Product
    { wch: 30 }, // Certification Type
    { wch: 35 }, // Standard / Code
    { wch: 30 }, // Issuing Authority
    { wch: 12 }, // Mandatory
    { wch: 15 }, // Applies In
    { wch: 35 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Products");

  // Supplier List sheet
  const supplierRows = [
    { Brand: "Gulf-O-Flex", "Supplier Name": "CENTURY MECHANICAL SYSTEMS FACTORY L L C" },
    { Brand: "Gulf-O-Flex", "Supplier Name": "ALDANUBE BUILDING MATERIALS LLC" },
  ];
  const ws2 = XLSX.utils.json_to_sheet(supplierRows);
  ws2["!cols"] = [{ wch: 20 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Supplier List");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=product-import-template.xlsx",
    },
  });
}
