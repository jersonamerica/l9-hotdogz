import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import ActivityLog from "@/components/ActivityLog";
import WelcomeBanner from "@/components/WelcomeBanner";
import GuildStats from "@/components/GuildStats";
import GearLeaderboard from "@/components/GearLeaderboard";
import StillNeeded from "@/components/StillNeeded";
import { getStats } from "@/lib/getStats";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Single server-side fetch for all dashboard data
  await connectDB();
  const [stats, dbUser] = await Promise.all([
    getStats(),
    User.findById(session?.user?.id).select("name").lean(),
  ]);

  const ign = (dbUser?.name as string) || null;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/dashboard_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Banner, Stats, Announcements, Leaderboard + Needed */}
            <div className="lg:col-span-2 space-y-6">
              <WelcomeBanner
                userName={session?.user?.name}
                ign={ign}
                totalMembers={stats.totalMembers}
                avgProgress={stats.avgProgress}
              />
              <AnnouncementBoard />
              <GuildStats
                totalMembers={stats.totalMembers}
                totalEquipment={stats.totalEquipment}
                avgCp={stats.avgCp}
                avgProgress={stats.avgProgress}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GearLeaderboard leaderboard={stats.leaderboard} />
                <StillNeeded
                  items={stats.mostNeeded}
                  totalMembers={stats.totalMembers}
                />
              </div>
            </div>

            {/* Right column: Activity Log (full height) */}
            <div className="lg:col-span-1">
              <ActivityLog />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
