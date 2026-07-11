import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Contract from "@/models/Contract";
import User from "@/models/User";

// GET /api/deliveries — Fetch deliveries where user is PM or supplier in the associated contract
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 1: Find contracts where user is PM or supplier
    const contracts = await Contract.find({
      $or: [{ pmId: auth.userId }, { supplierId: auth.userId }],
    })
      .select("_id contractNumber title pmId supplierId totalValue currency")
      .lean();

    const contractIds = contracts.map((c: any) => c._id);

    if (contractIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Find deliveries for those contracts
    const deliveries = await Delivery.find({
      contractId: { $in: contractIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Step 3: Build contract lookup and collect user IDs for PM/supplier profiles
    const contractMap = new Map(contracts.map((c: any) => [String(c._id), c]));

    const userIds = [
      ...new Set(
        contracts.flatMap((c: any) => [String(c.pmId), String(c.supplierId)])
      ),
    ];

    const users = await User.find({ _id: { $in: userIds } })
      .select("fullName companyName")
      .lean();

    const userMap = new Map(users.map((u: any) => [String(u._id), u]));

    // Step 4: Assemble response matching the Supabase join shape
    const data = deliveries.map((d: any) => {
      const contract = contractMap.get(String(d.contractId));
      const pm = contract ? userMap.get(String(contract.pmId)) : null;
      const supplier = contract ? userMap.get(String(contract.supplierId)) : null;

      return {
        id: d._id,
        contract_id: d.contractId,
        status: d.status,
        expected_delivery_date: d.expectedDeliveryDate || null,
        actual_delivery_date: d.actualDeliveryDate || null,
        tracking_number: d.trackingNumber || null,
        shipping_method: d.shippingMethod || null,
        notes: d.notes || null,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
        contracts: contract
          ? {
              id: contract._id,
              contract_number: contract.contractNumber,
              title: contract.title,
              pm_id: contract.pmId,
              supplier_id: contract.supplierId,
              total_value: contract.totalValue,
              currency: contract.currency,
              pm_profile: pm
                ? { full_name: pm.fullName, company_name: pm.companyName || null }
                : null,
              supplier_info: supplier
                ? { full_name: supplier.fullName, company_name: supplier.companyName || null }
                : null,
            }
          : null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}
