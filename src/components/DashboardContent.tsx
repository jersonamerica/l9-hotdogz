"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import WelcomeBanner from "./WelcomeBanner";
import GuildStats from "./GuildStats";
import GearLeaderboard from "./GearLeaderboard";
import StillNeeded from "./StillNeeded";
import AnnouncementBoard from "./AnnouncementBoard";
import ActivityLog from "./ActivityLog";
import MostActiveMembers from "./MostActiveMembers";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface StatsData {
  totalMembers: number;
  totalEquipment: number;
  avgCp: number;
  avgProgress: number;
  leaderboard: Array<{
    _id: string;
    name: string;
    image?: string;
    cp: number;
    mastery: string;
    gearProgress: number;
  }>;
  mostNeeded: Array<{
    _id: string;
    name: string;
    type: string;
    count: number;
  }>;
}

interface UserData {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  cp: number;
  mastery: string;
  role: string;
  isOnboarded: boolean;
}

export default function DashboardContent() {
  const { data: session } = useSession();
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: () => fetcher<StatsData>("/api/stats"),
  });
  const { data: user } = useQuery<UserData>({
    queryKey: ["user"],
    queryFn: () => fetcher<UserData>("/api/user"),
  });

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
      <div className="lg:col-span-1 space-y-6">
        <ActivityLog />
        <MostActiveMembers />
      </div>
    </div>
  );
}
