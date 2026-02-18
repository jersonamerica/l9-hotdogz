import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import NavBar from "@/components/NavBar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("isOnboarded")
      .lean();

    if (!user?.isOnboarded) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-game-dark">
      <NavBar />
      {children}
    </div>
  );
}
