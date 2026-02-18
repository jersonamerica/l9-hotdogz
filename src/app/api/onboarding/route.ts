import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { logActivity } from "@/lib/activityLogger";

// POST - complete onboarding
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    const { name, cp, mastery } = body;

    if (!name?.trim() || !mastery?.trim()) {
      return NextResponse.json(
        { error: "Name and mastery are required" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name: name.trim(),
          cp: Number(cp) || 0,
          mastery: mastery.trim(),
          isOnboarded: true,
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity(
      session.user.id,
      "member_joined",
      `${name.trim()} joined the guild`,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
