import { NextRequest, NextResponse } from "next/server";
import { generateSubmittal } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { productName, brand } = await req.json();

    if (!productName || !brand) {
      return NextResponse.json({ error: "Product name and brand are required" }, { status: 400 });
    }

    const submittal = await generateSubmittal(productName, brand);

    if (!submittal) {
      return NextResponse.json({ error: "Failed to generate submittal" }, { status: 500 });
    }

    return NextResponse.json(submittal);
  } catch (error: any) {
    console.error("Submittal generation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
