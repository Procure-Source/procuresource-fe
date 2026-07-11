import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Contract from "@/models/Contract";
import User from "@/models/User";

function formatDeliveryEvent(ev: any) {
  return {
    id: ev._id,
    event_type: ev.eventType,
    title: ev.title,
    description: ev.description || null,
    old_status: ev.oldStatus || null,
    new_status: ev.newStatus || null,
    created_by: ev.createdBy,
    created_at: ev.createdAt,
    // Populated creator
    creator: ev._creator
      ? { full_name: ev._creator.fullName }
      : undefined,
  };
}

// GET /api/deliveries/[id] — Fetch single delivery with contract info and events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const delivery = await Delivery.findById(id).lean();
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const d: any = delivery;

    // Fetch contract and event creators in parallel
    const creatorIds = [
      ...new Set(
        (d.events || [])
          .map((ev: any) => ev.createdBy)
          .filter(Boolean)
          .map(String)
      ),
    ];

    const [contract, creators] = await Promise.all([
      Contract.findById(d.contractId)
        .select("contractNumber title pmId supplierId")
        .lean(),
      User.find({ _id: { $in: creatorIds } })
        .select("fullName")
        .lean(),
    ]);

    const creatorMap = new Map(creators.map((u: any) => [String(u._id), u]));

    // Attach creator data to events
    const eventsWithCreators = (d.events || []).map((ev: any) => {
      ev._creator = creatorMap.get(String(ev.createdBy)) || null;
      return formatDeliveryEvent(ev);
    });

    const data: any = {
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
      delivery_events: eventsWithCreators,
      contracts: contract
        ? {
            id: (contract as any)._id,
            contract_number: (contract as any).contractNumber,
            title: (contract as any).title,
            pm_id: (contract as any).pmId,
            supplier_id: (contract as any).supplierId,
          }
        : null,
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

// PUT /api/deliveries/[id] — Update delivery fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Map incoming snake_case fields to camelCase model fields
    const fieldMap: Record<string, string> = {
      status: "status",
      expected_delivery_date: "expectedDeliveryDate",
      actual_delivery_date: "actualDeliveryDate",
      tracking_number: "trackingNumber",
      shipping_method: "shippingMethod",
      notes: "notes",
    };

    const updates: Record<string, unknown> = {};
    for (const [snakeKey, camelKey] of Object.entries(fieldMap)) {
      if (body[snakeKey] !== undefined) {
        updates[camelKey] = body[snakeKey];
      }
    }

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const d: any = delivery;
    const data = {
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
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update delivery" },
      { status: 500 }
    );
  }
}
