import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Equipment } from "@/models/Equipment";

export interface StatsData {
  totalMembers: number;
  totalEquipment: number;
  avgCp: number;
  avgProgress: number;
  mostNeeded: { _id: string; name: string; type: string; count: number }[];
  leaderboard: {
    _id: string;
    name: string;
    image?: string;
    cp: number;
    mastery: string;
    gearProgress: number;
  }[];
}

export async function getStats(): Promise<StatsData> {
  await connectDB();

  const [totalEquipment, members] = await Promise.all([
    Equipment.countDocuments(),
    User.find({ isOnboarded: true })
      .select("name image cp mastery gearLog")
      .populate("gearLog.equipment", "name type")
      .lean(),
  ]);

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
      _id: String(m._id),
      name: m.name as string,
      image: m.image as string | undefined,
      cp: (m.cp as number) || 0,
      mastery: m.mastery as string,
      gearProgress: progress,
      neededItems: validGear.map((g: unknown) => {
        const entry = g as {
          equipment: { _id: string; name: string; type: string };
        };
        return {
          _id: String(entry.equipment._id),
          name: entry.equipment.name,
          type: entry.equipment.type,
        };
      }),
    };
  });

  const totalMembers = members.length;
  const avgCp =
    totalMembers > 0
      ? Math.round(memberStats.reduce((sum, m) => sum + m.cp, 0) / totalMembers)
      : 0;
  const avgProgress =
    totalMembers > 0
      ? Math.round(
          memberStats.reduce((sum, m) => sum + m.gearProgress, 0) /
            totalMembers,
        )
      : 0;

  const itemNeedCount: Record<
    string,
    { _id: string; name: string; type: string; count: number }
  > = {};
  for (const m of memberStats) {
    for (const item of m.neededItems) {
      if (item.type.toLowerCase() !== "gear") {
        continue;
      }
      const id = item._id;
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

  const leaderboard = [...memberStats]
    .sort((a, b) => b.gearProgress - a.gearProgress || b.cp - a.cp)
    .slice(0, 10)
    .map(({ _id, name, image, cp, mastery, gearProgress }) => ({
      _id,
      name,
      image,
      cp,
      mastery,
      gearProgress,
    }));

  return {
    totalMembers,
    totalEquipment,
    avgCp,
    avgProgress,
    mostNeeded,
    leaderboard,
  };
}
