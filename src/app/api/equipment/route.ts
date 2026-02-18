import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Equipment } from "@/models/Equipment";
import { logActivity } from "@/lib/activityLogger";

// GET all equipment
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const equipment = await Equipment.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 },
    );
  }
}

// POST create new equipment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    const equipment = await Equipment.create({
      name: body.name,
      type: body.type,
      createdBy: session.user.id,
    });

    await logActivity(
      session.user.id,
      "equipment_added",
      `Added ${body.type}: ${body.name}`,
    );

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 },
    );
  }
}
