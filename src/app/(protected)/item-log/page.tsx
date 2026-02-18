import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import EquipmentList from "@/components/EquipmentList";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div
      className="min-h-screen bg-game-dark bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/equipment_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <nav className="bg-game-nav/80 backdrop-blur-sm border-b border-game-border">
          <div className="w-[90%] mx-auto py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-game-accent flex items-center gap-2">
              <img src="/logo/hotdog_logo.png" alt="Logo" className="w-20 h-20" />{" "}
              MC ` HotdogzZ
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-game-text-muted hover:text-game-accent font-medium text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/item-log"
                className="text-game-accent font-medium text-sm"
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
          <h2 className="text-2xl font-bold text-game-text mb-6 flex items-center gap-2">
            <span>🛡️</span> Item Log
          </h2>
          <EquipmentList
            isAdmin={(session?.user as { role?: string })?.role === "admin"}
          />
        </main>
      </div>
    </div>
  );
}
