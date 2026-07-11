import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wb = XLSX.utils.book_new();

  // Brands template
  const brandRows = [
    { Name: "AcmeCool", Category: "Chillers", Description: "Leading HVAC brand", Website: "https://acmecool.com", "Logo URL": "" },
  ];
  const brandSheet = XLSX.utils.json_to_sheet(brandRows);
  brandSheet["!cols"] = [
    { wch: 20 }, { wch: 18 }, { wch: 30 }, { wch: 25 }, { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, brandSheet, "Brands");

  // Products template
  const productRows = [
    {
      Name: "Example Chiller Unit", Brand: "AcmeCool", Category: "Chillers",
      "Model Number": "CH-500", Description: "500 TR centrifugal chiller",
      "Min Price": 50000, "Max Price": 75000, Currency: "AED",
      Availability: "in_stock", "Service Regions": "UAE, Saudi Arabia, Qatar",
    },
  ];
  const productSheet = XLSX.utils.json_to_sheet(productRows);
  productSheet["!cols"] = [
    { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 35 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, productSheet, "Products");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=brands-products-template.xlsx",
    },
  });
}
