import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

// PUT update an event
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const { title, participantIds } = await req.json();

    if (!title || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Title and participants are required" },
        { status: 400 },
      );
    }

    // Get the existing event to compare participants
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const oldParticipantIds = existingEvent.participants.map((p: mongoose.Types.ObjectId) =>
      p.toString(),
    );
    const newParticipantIds = participantIds.map((id: string) => id.toString());

    // Find removed and added participants
    const removedIds = oldParticipantIds.filter(
      (id: string) => !newParticipantIds.includes(id),
    );
    const addedIds = newParticipantIds.filter(
      (id: string) => !oldParticipantIds.includes(id),
    );

    // Decrement attendance for removed participants
    if (removedIds.length > 0) {
      await User.updateMany(
        { _id: { $in: removedIds } },
        { $inc: { attendancePoints: -1 } },
      );
    }

    // Increment attendance for added participants
    if (addedIds.length > 0) {
      await User.updateMany(
        { _id: { $in: addedIds } },
        { $inc: { attendancePoints: 1 } },
      );
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title: title.trim(), participants: participantIds },
      { new: true },
    )
      .populate("participants", "name image")
      .populate("createdBy", "name")
      .lean();

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

// DELETE an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Decrement attendancePoints for all participants
    if (event.participants.length > 0) {
      await User.updateMany(
        { _id: { $in: event.participants } },
        { $inc: { attendancePoints: -1 } },
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
