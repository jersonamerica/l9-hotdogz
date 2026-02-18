import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EquipmentList from "@/components/EquipmentList";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/equipment_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
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
