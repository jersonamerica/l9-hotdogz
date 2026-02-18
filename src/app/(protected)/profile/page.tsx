import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ProfileEditor from "@/components/ProfileEditor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div
      className="min-h-screen bg-game-dark bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/profile_bg.jpg')" }}
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
                className="text-game-accent font-medium text-sm"
              >
                Profile
              </Link>
              {session && <LogoutButton />}
            </div>
          </div>
        </nav>

        <main className="w-[90%] mx-auto py-12">
          <ProfileEditor />
        </main>
      </div>
    </div>
  );
}
