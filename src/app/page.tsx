import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // Not authenticated — show login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  await connectDB();
  const user = await User.findById(session.user.id)
    .select("isOnboarded")
    .lean();

  if (!user?.isOnboarded) {
    redirect("/onboarding");
  }

  // Authenticated + onboarded → go to the protected home page
  redirect("/dashboard");
}
