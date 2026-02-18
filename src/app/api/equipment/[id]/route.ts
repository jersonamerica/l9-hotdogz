import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Equipment } from "@/models/Equipment";
import { logActivity } from "@/lib/activityLogger";

// PUT update equipment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      {
        name: body.name,
        type: body.type,
      },
      { new: true, runValidators: true },
    );

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 },
      );
    }

    await logActivity(
      session.user.id,
      "equipment_updated",
      `Updated ${body.type}: ${body.name}`,
    );

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 },
    );
  }
}

// DELETE equipment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 },
      );
    }

    await logActivity(
      session.user.id,
      "equipment_deleted",
      `Deleted ${equipment.type}: ${equipment.name}`,
    );

    return NextResponse.json({ message: "Equipment deleted" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 },
    );
  }
}
