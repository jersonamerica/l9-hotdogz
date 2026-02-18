import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { logActivity } from "@/lib/activityLogger";

// PUT update announcement (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const { title, content, pinned } = await req.json();

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(title !== undefined && { title: title.trim() }),
          ...(content !== undefined && { content: content.trim() }),
          ...(pinned !== undefined && { pinned }),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name image")
      .lean();

    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await logActivity(
      session.user.id,
      "announcement_updated",
      `Updated announcement`,
    );

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 },
    );
  }
}

// DELETE announcement (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await logActivity(
      session.user.id,
      "announcement_deleted",
      `Deleted announcement`,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
