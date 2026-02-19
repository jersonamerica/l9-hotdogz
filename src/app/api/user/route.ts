import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import "@/models/Equipment";
import { logActivity } from "@/lib/activityLogger";

// GET current user profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select(
        "name email image cp mastery equipmentType userEquipmentItems gearLog role isOnboarded",
      )
      .populate("gearLog.equipment", "name type")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter out gear log entries where equipment was deleted
    const filteredUser = {
      ...user,
      gearLog: (user.gearLog || []).filter((entry) => entry.equipment != null),
    };

    return NextResponse.json(filteredUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT update user profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    // Determine which user to update (admin can update other users)
    const targetUserId = body.userId || session.user.id;

    // If trying to update another user, check if admin
    if (targetUserId !== session.user.id) {
      const adminUser = await User.findById(session.user.id).select("role");
      if (adminUser?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Fetch the current user before updating
    const currentUser = await User.findById(targetUserId)
      .select(
        "name email image cp mastery equipmentType userEquipmentItems gearLog role",
      )
      .populate("gearLog.equipment", "name type")
      .lean();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.cp !== undefined) updateData.cp = Number(body.cp);
    if (body.mastery !== undefined) updateData.mastery = body.mastery;
    if (body.equipmentType !== undefined)
      updateData.equipmentType = body.equipmentType;
    if (body.userEquipmentItems !== undefined)
      updateData.userEquipmentItems = body.userEquipmentItems;
    if (body.gearLog !== undefined) updateData.gearLog = body.gearLog;

    // Compare old and new values, but only log property names that actually changed
    const changedFields: string[] = [];
    for (const key of Object.keys(updateData)) {
      if (key === "gearLog") continue;
      const oldValue = (currentUser as Record<string, unknown>)[key];
      const newValue = updateData[key];
      if (oldValue !== newValue) {
        changedFields.push(key);
      }
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select(
        "name email image cp mastery equipmentType userEquipmentItems gearLog role",
      )
      .populate("gearLog.equipment", "name type")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter out gear log entries where equipment was deleted
    const filteredUser = {
      ...user,
      gearLog: (user.gearLog || []).filter((entry) => entry.equipment != null),
    };

    // Log profile updates with property names only (if value actually changed)
    if (changedFields.length > 0) {
      const logMsg =
        targetUserId !== session.user.id
          ? `Admin updated gear log for ${user?.name || "unknown"}`
          : `Updated ${changedFields.join(", ")}`;

      await logActivity(session.user.id, "profile_updated", logMsg);
    }

    return NextResponse.json(filteredUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
