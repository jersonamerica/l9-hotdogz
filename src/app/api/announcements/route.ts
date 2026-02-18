import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { logActivity } from "@/lib/activityLogger";

// GET all announcements
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const announcements = await Announcement.find()
      .populate("createdBy", "name image")
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

// POST create announcement (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    await connectDB();
    const { title, content, pinned } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      pinned: pinned || false,
      createdBy: session.user.id,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate("createdBy", "name image")
      .lean();

    await logActivity(
      session.user.id,
      "announcement_created",
      `Posted: ${title.trim()}`,
    );

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}
