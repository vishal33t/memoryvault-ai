import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's reminders
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        screenshot: {
          include: {
            extractedInformation: true,
          },
        },
      },
      orderBy: {
        remindAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error("Get reminders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reminders.",
      },
      { status: 500 }
    );
  }
}


// POST - Create a reminder
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = body.title?.trim();
    const remindAt = body.remindAt;
    const screenshotId = body.screenshotId || null;

    if (!title) {
      return NextResponse.json(
        { message: "Reminder title is required." },
        { status: 400 }
      );
    }

    if (!remindAt) {
      return NextResponse.json(
        { message: "Reminder date and time are required." },
        { status: 400 }
      );
    }

    const reminderDate = new Date(remindAt);

    if (Number.isNaN(reminderDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid reminder date." },
        { status: 400 }
      );
    }

    if (reminderDate <= new Date()) {
      return NextResponse.json(
        { message: "Reminder must be set for a future date." },
        { status: 400 }
      );
    }

    // If a screenshot is attached,
    // make sure it belongs to the logged-in user.
    if (screenshotId) {
      const screenshot = await prisma.screenshot.findFirst({
        where: {
          id: screenshotId,
          userId: session.user.id,
        },
      });

      if (!screenshot) {
        return NextResponse.json(
          { message: "Screenshot not found." },
          { status: 404 }
        );
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        screenshotId,
        title,
        remindAt: reminderDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reminder created successfully.",
        reminder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reminder.",
      },
      { status: 500 }
    );
  }
}