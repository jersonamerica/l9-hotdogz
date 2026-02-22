import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { WeaponGrant } from "@/models/WeaponGrant";
import { MASTERY_OPTIONS } from "@/lib/constants";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const adminUser = await User.findById(session.user.id).select("role name").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const weapon = String(body.weapon || "").trim();

    if (!userId || !weapon) {
      return NextResponse.json(
        { error: "userId and weapon are required" },
        { status: 400 },
      );
    }

    if (!MASTERY_OPTIONS.includes(weapon as (typeof MASTERY_OPTIONS)[number])) {
      return NextResponse.json({ error: "Invalid weapon" }, { status: 400 });
    }

    const targetUser = await User.findById(userId).select("name").lean();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const grant = await WeaponGrant.create({
      user: userId,
      weapon,
      grantedBy: session.user.id,
      grantedAt: new Date(),
    });

    await logActivity(
      session.user.id,
      "admin_updated_user",
      `Gave ${weapon} to ${targetUser.name || "Unknown"}`,
    );

    return NextResponse.json(
      {
        _id: String(grant._id),
        user: userId,
        weapon,
        grantedBy: session.user.id,
        grantedAt: grant.grantedAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating weapon grant:", error);
    return NextResponse.json(
      { error: "Failed to create weapon grant" },
      { status: 500 },
    );
  }
}
