import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Equipment } from "@/models/Equipment";

// GET guild-wide stats for the homepage
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [totalEquipment, , members] = await Promise.all([
      Equipment.countDocuments(),
      Equipment.find().select("name type").lean(),
      User.find({ isOnboarded: true })
        .select("name image cp mastery gearLog")
        .populate("gearLog.equipment", "name type")
        .lean(),
    ]);

    // Calculate per-member progress
    const memberStats = members.map((m) => {
      const validGear = (m.gearLog || []).filter(
        (g: { equipment: unknown }) => g.equipment != null,
      );
      const neededCount = validGear.length;
      const ownedCount = Math.max(totalEquipment - neededCount, 0);
      const progress =
        totalEquipment > 0
          ? Math.round((ownedCount / totalEquipment) * 100)
          : 100;

      return {
        _id: m._id,
        name: m.name,
        image: m.image,
        cp: m.cp || 0,
        mastery: m.mastery,
        gearProgress: progress,
        neededItems: validGear.map((g: unknown) => {
          const entry = g as {
            equipment: { _id: string; name: string; type: string };
          };
          return {
            _id: entry.equipment._id,
            name: entry.equipment.name,
            type: entry.equipment.type,
          };
        }),
      };
    });

    // Guild-wide stats
    const totalMembers = members.length;
    const avgCp =
      totalMembers > 0
        ? Math.round(
            memberStats.reduce((sum, m) => sum + m.cp, 0) / totalMembers,
          )
        : 0;
    const avgProgress =
      totalMembers > 0
        ? Math.round(
            memberStats.reduce((sum, m) => sum + m.gearProgress, 0) /
              totalMembers,
          )
        : 0;

    // Most needed items (count how many members need each item)
    const itemNeedCount: Record<
      string,
      { _id: string; name: string; type: string; count: number }
    > = {};
    for (const m of memberStats) {
      for (const item of m.neededItems) {
        const id = String(item._id);
        if (!itemNeedCount[id]) {
          itemNeedCount[id] = {
            _id: id,
            name: item.name,
            type: item.type,
            count: 0,
          };
        }
        itemNeedCount[id].count++;
      }
    }
    const mostNeeded = Object.values(itemNeedCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Leaderboard (top 10 by gear progress, then by CP)
    const leaderboard = [...memberStats]
      .sort((a, b) => b.gearProgress - a.gearProgress || b.cp - a.cp)
      .slice(0, 10);

    return NextResponse.json({
      totalMembers,
      totalEquipment,
      avgCp,
      avgProgress,
      mostNeeded,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching guild stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
