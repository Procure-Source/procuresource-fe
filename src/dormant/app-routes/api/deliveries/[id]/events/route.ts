import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Contract from "@/models/Contract";
import { notifyDeliveryUpdate } from "@/lib/notifications";

// GET /api/deliveries/[id]/events — Return embedded delivery events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const delivery = await Delivery.findById(id).select("events").lean();
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const events = ((delivery as any).events || []).map((ev: any) => ({
      id: ev._id,
      delivery_id: id,
      event_type: ev.eventType,
      title: ev.title,
      description: ev.description || null,
      old_status: ev.oldStatus || null,
      new_status: ev.newStatus || null,
      created_by: ev.createdBy,
      created_at: ev.createdAt,
    }));

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/deliveries/[id]/events — Add a new event to the delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, title, description, new_status } = body;

    if (!title) {
      return NextResponse.json({ error: "Event title required" }, { status: 400 });
    }

    // Get current delivery status for old_status tracking
    const delivery = await Delivery.findById(id).select("status contractId").lean();
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const oldStatus = (delivery as any).status || null;

    const newEvent = {
      eventType: event_type || "note",
      title,
      description: description || undefined,
      oldStatus: oldStatus,
      newStatus: new_status || undefined,
      createdBy: auth.userId,
    };

    // Push the new event into the embedded events array
    const updated = await Delivery.findByIdAndUpdate(
      id,
      {
        $push: { events: newEvent },
        // If status change, update delivery status too
        ...(new_status && event_type === "status_change"
          ? {
              $set: {
                status: new_status,
                ...(new_status === "delivered"
                  ? { actualDeliveryDate: new Date() }
                  : {}),
              },
            }
          : {}),
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
    }

    // Return the newly added event (last in the array)
    const events = (updated as any).events || [];
    const addedEvent = events[events.length - 1];

    const response = {
      id: addedEvent._id,
      delivery_id: id,
      event_type: addedEvent.eventType,
      title: addedEvent.title,
      description: addedEvent.description || null,
      old_status: addedEvent.oldStatus || null,
      new_status: addedEvent.newStatus || null,
      created_by: addedEvent.createdBy,
      created_at: addedEvent.createdAt,
    };

    // Notify the other party about the delivery update
    const contract = await Contract.findById((delivery as any).contractId).select("pmId supplierId").lean();
    if (contract) {
      const notifyType = new_status === "shipped" ? "delivery_shipped" as const
        : new_status === "delivered" ? "delivery_delivered" as const
        : "delivery_update" as const;
      // Notify the party who didn't create this event
      const recipientId = auth.userId === String((contract as any).pmId)
        ? String((contract as any).supplierId)
        : String((contract as any).pmId);
      notifyDeliveryUpdate(
        recipientId,
        title,
        id,
        String((contract as any)._id),
        notifyType
      ).catch(() => {});
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add event" },
      { status: 500 }
    );
  }
}
