import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import "@/models/User";

// GET recent activity logs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const logs = await ActivityLog.find()
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json(logs, {
      headers: {
        "Cache-Control": "private, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}
