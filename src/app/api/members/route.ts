import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Equipment } from "@/models/Equipment";

// GET all guild members with gear progress
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Get total equipment count for progress calculation
    const totalEquipment = await Equipment.countDocuments();

    const members = await User.find({ isOnboarded: true })
      .select(
        "name image cp mastery gearLog role createdAt equipmentType userEquipmentItems userAbilities userMounts attendancePoints",
      )
      .populate("gearLog.equipment", "name type")
      .sort({ cp: -1 })
      .lean();

    // Add gear progress to each member
    // Gear log = items the user still NEEDS, so:
    //   owned = totalEquipment - neededCount
    //   progress = (owned / totalEquipment) * 100
    const membersWithProgress = members.map((member) => {
      // Filter out null equipment refs (deleted items)
      const validGear = (member.gearLog || []).filter(
        (g) => g.equipment != null,
      );
      const neededCount = validGear.length;
      const ownedCount = Math.max(totalEquipment - neededCount, 0);
      const progress =
        totalEquipment > 0
          ? Math.round((ownedCount / totalEquipment) * 100)
          : 100;

      return {
        ...member,
        gearLog: validGear,
        neededCount,
        ownedCount,
        totalEquipment,
        gearProgress: progress,
      };
    });

    return NextResponse.json(membersWithProgress, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}
