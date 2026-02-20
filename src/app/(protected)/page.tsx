import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import ActivityLog from "@/components/ActivityLog";
import WelcomeBanner from "@/components/WelcomeBanner";
import GuildStats from "@/components/GuildStats";
import GearLeaderboard from "@/components/GearLeaderboard";
import StillNeeded from "@/components/StillNeeded";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div
      className="min-h-screen bg-game-dark bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/dashboard_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <nav className="bg-game-nav/80 backdrop-blur-sm border-b border-game-border">
          <div className="w-[90%] mx-auto py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-game-accent flex items-center gap-2">
              <Image
                src="/logo/hotdog_logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="w-20 h-20"
              />{" "}
              MC ` HotdogzZ
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-game-accent font-medium text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/item-log"
                className="text-game-text-muted hover:text-game-accent font-medium text-sm transition-colors"
              >
                Item Log
              </Link>
              <Link
                href="/members"
                className="text-game-text-muted hover:text-game-accent font-medium text-sm transition-colors"
              >
                Members
              </Link>
              <Link
                href="/profile"
                className="text-game-text-muted hover:text-game-accent font-medium text-sm transition-colors"
              >
                Profile
              </Link>
              {session && <LogoutButton />}
            </div>
          </div>
        </nav>

        <main className="w-[90%] mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Banner, Stats, Announcements, Leaderboard + Needed */}
            <div className="lg:col-span-2 space-y-6">
              <WelcomeBanner userName={session?.user?.name} />
              <AnnouncementBoard />
              <GuildStats />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GearLeaderboard />
                <StillNeeded />
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
