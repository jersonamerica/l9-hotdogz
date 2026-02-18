import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // If already onboarded, redirect to home
  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("isOnboarded")
      .lean();
    if (user?.isOnboarded) {
      redirect("/");
    }
  }

  return <OnboardingForm />;
}
