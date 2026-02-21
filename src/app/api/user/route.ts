import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import "@/models/Equipment";
import { logActivitiesBatch, ActivityLogEntry } from "@/lib/activityLogger";

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
        "name image cp mastery equipmentType userEquipmentItems userEquipmentAccessories userAbilities userMounts gearLog role isOnboarded",
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
    console.log("body:", body);

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
        "name image cp mastery equipmentType userEquipmentItems userEquipmentAccessories userAbilities userMounts gearLog role",
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
    if (body.userEquipmentAccessories !== undefined)
      updateData.userEquipmentAccessories = body.userEquipmentAccessories;
    if (body.userAbilities !== undefined)
      updateData.userAbilities = body.userAbilities;
    if (body.userMounts !== undefined) updateData.userMounts = body.userMounts;
    if (body.gearLog !== undefined) updateData.gearLog = body.gearLog;

    const isAdmin = targetUserId !== session.user.id;

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select(
        "name image cp mastery equipmentType userEquipmentItems userEquipmentAccessories userAbilities userMounts gearLog role",
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

    // Detailed activity logging - collect all logs and batch insert
    const userName = user.name || "Unknown";
    const activityLogs: ActivityLogEntry[] = [];

    // Log simple field changes (name, cp, mastery, equipmentType)
    // These fields can only be updated by the user themselves, not by admin
    if (body.name !== undefined && currentUser.name !== body.name) {
      activityLogs.push({
        action: "name_updated",
        user: session.user.id,
        details: `Name: ${currentUser.name} → ${body.name}`,
      });
    }

    if (body.cp !== undefined && currentUser.cp !== Number(body.cp)) {
      activityLogs.push({
        action: "cp_updated",
        user: session.user.id,
        details: `CP: ${currentUser.cp} → ${Number(body.cp)}`,
      });
    }

    if (body.mastery !== undefined && currentUser.mastery !== body.mastery) {
      activityLogs.push({
        action: "mastery_updated",
        user: session.user.id,
        details: `Mastery: ${currentUser.mastery} → ${body.mastery}`,
      });
    }

    if (
      body.equipmentType !== undefined &&
      currentUser.equipmentType !== body.equipmentType
    ) {
      activityLogs.push({
        action: "equipment_type_updated",
        user: session.user.id,
        details: `Equipment Type: ${currentUser.equipmentType} → ${body.equipmentType}`,
      });
    }

    // Log array changes (added/removed items)
    // Legendary Equipment (userEquipmentItems)
    if (body.userEquipmentItems !== undefined) {
      const oldItems = currentUser.userEquipmentItems || [];
      const newItems = body.userEquipmentItems || [];
      const added = newItems.filter((item: string) => !oldItems.includes(item));
      const removed = oldItems.filter(
        (item: string) => !newItems.includes(item),
      );

      for (const item of added) {
        const action = isAdmin
          ? "admin_updated_user"
          : "legendary_equipment_added";
        const details = isAdmin
          ? `Added ${item} to ${userName}'s owned equipment`
          : `Added ${item} as owned equipment`;
        activityLogs.push({ action, user: session.user.id, details });
      }

      for (const item of removed) {
        const action = isAdmin
          ? "admin_updated_user"
          : "legendary_equipment_removed";
        const details = isAdmin
          ? `Removed ${item} from ${userName}'s owned equipment`
          : `Removed ${item} as owned equipment`;
        activityLogs.push({ action, user: session.user.id, details });
      }
    }

    // Accessories (userEquipmentAccessories)
    if (body.userEquipmentAccessories !== undefined) {
      const oldItems = currentUser.userEquipmentAccessories || [];
      const newItems = body.userEquipmentAccessories || [];
      const added = newItems.filter((item: string) => !oldItems.includes(item));
      const removed = oldItems.filter(
        (item: string) => !newItems.includes(item),
      );

      for (const item of added) {
        const action = isAdmin ? "admin_updated_user" : "accessory_added";
        const details = isAdmin
          ? `Added ${item} to ${userName}'s owned accessories`
          : `Added ${item} as owned accessory`;
        activityLogs.push({ action, user: session.user.id, details });
      }

      for (const item of removed) {
        const action = isAdmin ? "admin_updated_user" : "accessory_removed";
        const details = isAdmin
          ? `Removed ${item} from ${userName}'s owned accessories`
          : `Removed ${item} as owned accessory`;
        activityLogs.push({ action, user: session.user.id, details });
      }
    }

    // Abilities (userAbilities)
    if (body.userAbilities !== undefined) {
      const oldItems = currentUser.userAbilities || [];
      const newItems = body.userAbilities || [];
      const added = newItems.filter((item: string) => !oldItems.includes(item));
      const removed = oldItems.filter(
        (item: string) => !newItems.includes(item),
      );

      for (const item of added) {
        const action = isAdmin ? "admin_updated_user" : "ability_added";
        const details = isAdmin
          ? `Added ${item} to ${userName}'s owned abilities`
          : `Added ${item} as owned ability`;
        activityLogs.push({ action, user: session.user.id, details });
      }

      for (const item of removed) {
        const action = isAdmin ? "admin_updated_user" : "ability_removed";
        const details = isAdmin
          ? `Removed ${item} from ${userName}'s owned abilities`
          : `Removed ${item} as owned ability`;
        activityLogs.push({ action, user: session.user.id, details });
      }
    }

    // Mounts (userMounts)
    if (body.userMounts !== undefined) {
      const oldItems = currentUser.userMounts || [];
      const newItems = body.userMounts || [];
      const added = newItems.filter((item: string) => !oldItems.includes(item));
      const removed = oldItems.filter(
        (item: string) => !newItems.includes(item),
      );

      for (const item of added) {
        const action = isAdmin ? "admin_updated_user" : "mount_added";
        const details = isAdmin
          ? `Added ${item} to ${userName}'s owned mounts`
          : `Added ${item} as owned mount`;
        activityLogs.push({ action, user: session.user.id, details });
      }

      for (const item of removed) {
        const action = isAdmin ? "admin_updated_user" : "mount_removed";
        const details = isAdmin
          ? `Removed ${item} from ${userName}'s owned mounts`
          : `Removed ${item} as owned mount`;
        activityLogs.push({ action, user: session.user.id, details });
      }
    }

    // Gear Log (item log)
    if (body.gearLog !== undefined) {
      const oldLog = currentUser.gearLog || [];
      const newLog = body.gearLog || [];

      interface GearLogEntry {
        equipment?:
          | { _id?: { toString: () => string }; name?: string }
          | string;
      }

      const oldEqIds = oldLog.map(
        (entry: GearLogEntry) =>
          (typeof entry.equipment === "object" &&
            "_id" in entry.equipment &&
            entry.equipment._id?.toString()) ||
          (typeof entry.equipment === "string" ? entry.equipment : ""),
      );
      const newEqIds = newLog.map(
        (entry: GearLogEntry) =>
          (typeof entry.equipment === "object" &&
            "_id" in entry.equipment &&
            entry.equipment._id?.toString()) ||
          (typeof entry.equipment === "string" ? entry.equipment : ""),
      );

      const addedIds = newEqIds.filter((id: string) => !oldEqIds.includes(id));
      const removedIds = oldEqIds.filter(
        (id: string) => !newEqIds.includes(id),
      );

      // Get equipment names from the updated user object (populated)
      const updatedLog = user.gearLog || [];

      for (const eqId of addedIds) {
        const entry = updatedLog.find(
          (e: GearLogEntry) =>
            (typeof e.equipment === "object" &&
              "_id" in e.equipment &&
              e.equipment._id?.toString()) === eqId ||
            (typeof e.equipment === "string" && e.equipment) === eqId,
        );
        const equipmentName =
          (typeof entry?.equipment === "object" &&
            entry.equipment &&
            "name" in entry.equipment &&
            entry.equipment.name) ||
          "an item";
        const details = `Added ${equipmentName} to item log`;
        activityLogs.push({
          action: "item_log_added",
          user: session.user.id,
          details,
        });
      }

      // Find equipment names for removed items
      for (const eqId of removedIds) {
        const entry = oldLog.find(
          (e: GearLogEntry) =>
            (typeof e.equipment === "object" &&
              "_id" in e.equipment &&
              e.equipment._id?.toString()) === eqId ||
            (typeof e.equipment === "string" && e.equipment) === eqId,
        );
        const equipmentName =
          (typeof entry?.equipment === "object" &&
            entry.equipment &&
            "name" in entry.equipment &&
            entry.equipment.name) ||
          "an item";
        const action = isAdmin ? "admin_updated_user" : "item_log_removed";
        const details = isAdmin
          ? `Removed ${equipmentName} from ${userName}'s item log`
          : `Removed ${equipmentName} from item log`;
        activityLogs.push({
          action,
          user: session.user.id,
          details,
        });
      }
    }

    // Batch insert all activity logs in a single database operation
    await logActivitiesBatch(activityLogs);

    return NextResponse.json(filteredUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
