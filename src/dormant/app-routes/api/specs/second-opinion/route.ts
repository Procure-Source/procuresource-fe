import { buildSecondOpinionFraming, riskTransferClauses } from "@/lib/ecosystem-signals";
import { analyzeSpec } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

function pickVerdict(score: number, hasCriticalWarning: boolean, hasVerifiedMatch: boolean) {
  if (hasCriticalWarning) {
    return "Not equivalent until evidence is corrected";
  }
  if (hasVerifiedMatch && score >= 90) {
    return "Likely equivalent with documented controls";
  }
  if (hasVerifiedMatch) {
    return "Verified evidence found, equivalency still requires consultant review";
  }
  if (score >= 80) {
    return "Possibly equivalent, consultant review required";
  }
  return "Weak equivalency case";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const originalSpec = String(body.originalSpec || "").trim();
    const proposedSubstitution = String(body.proposedSubstitution || "").trim();

    if (!originalSpec || !proposedSubstitution) {
      return NextResponse.json(
        { error: "Original specification and proposed substitution are required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeSpec(`Original specification:\n${originalSpec}\n\nProposed substitution:\n${proposedSubstitution}`);
    const topMatch = analysis.matches[0];
    const warnings = topMatch?.warnings || [];
    const hasCriticalWarning = warnings.some((warning) =>
      /mismatch|not found|unverified|stale|non-compliant/i.test(warning)
    );
    const hasVerifiedMatch = topMatch?.verificationStatus === "verified";

    return NextResponse.json({
      ...buildSecondOpinionFraming(),
      generatedOn: new Date().toISOString().slice(0, 10),
      verdict: pickVerdict(topMatch?.score || 0, hasCriticalWarning, hasVerifiedMatch),
      topMatch,
      requirements: analysis.requirements || [],
      regionFlags: analysis.regionFlags || [],
      warnings,
      riskTransferLanguage: riskTransferClauses.find((clause) => clause.title === "Substitution Approval")?.text,
      sourceMode: analysis.parameters["Source Mode"],
    });
  } catch (error) {
    console.error("Second opinion error:", error);
    return NextResponse.json({ error: "Failed to generate second opinion" }, { status: 500 });
  }
}
