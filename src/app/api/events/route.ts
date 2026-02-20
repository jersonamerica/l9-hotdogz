import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Event } from "@/models/Event";
import { User } from "@/models/User";

// GET all events
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const events = await Event.find()
      .populate("participants", "name image")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST create a new event
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();

    const { title, participantIds } = await req.json();

    if (!title || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Title and participants are required" },
        { status: 400 },
      );
    }

    // Create the event
    const event = await Event.create({
      title: title.trim(),
      participants: participantIds,
      createdBy: session.user.id,
    });

    // Increment attendancePoints for all participants
    await User.updateMany(
      { _id: { $in: participantIds } },
      { $inc: { attendancePoints: 1 } },
    );

    // Populate and return the created event
    const populatedEvent = await Event.findById(event._id)
      .populate("participants", "name image")
      .populate("createdBy", "name")
      .lean();

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
