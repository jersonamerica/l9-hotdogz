"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import WelcomeBanner from "./WelcomeBanner";
import GuildStats from "./GuildStats";
import GearLeaderboard from "./GearLeaderboard";
import StillNeeded from "./StillNeeded";
import AnnouncementBoard from "./AnnouncementBoard";
import ActivityLog from "./ActivityLog";

export default function DashboardContent() {
  const { data: session } = useSession();
  const { data: stats } = useSWR("/api/stats");
  const { data: user } = useSWR("/api/user");

  const ign = user?.name || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        <WelcomeBanner
          userName={session?.user?.name}
          ign={ign}
          totalMembers={stats?.totalMembers ?? 0}
          avgProgress={stats?.avgProgress ?? 0}
        />
        <AnnouncementBoard />
        <GuildStats
          totalMembers={stats?.totalMembers ?? 0}
          totalEquipment={stats?.totalEquipment ?? 0}
          avgCp={stats?.avgCp ?? 0}
          avgProgress={stats?.avgProgress ?? 0}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GearLeaderboard leaderboard={stats?.leaderboard ?? []} />
          <StillNeeded
            items={stats?.mostNeeded ?? []}
            totalMembers={stats?.totalMembers ?? 0}
          />
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-1">
        <ActivityLog />
      </div>
    </div>
  );
}
