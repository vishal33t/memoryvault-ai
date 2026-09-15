import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const now = new Date();

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
        completed: false,
        remindAt: {
          lte: now,
        },
        notified: false,
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

    if (reminders.length === 0) {
      return NextResponse.json({
        success: true,
        notifications: [],
      });
    }

    const reminderIds = reminders.map(
      (reminder) => reminder.id
    );

    await prisma.reminder.updateMany({
      where: {
        id: {
          in: reminderIds,
        },
        userId: session.user.id,
      },
      data: {
        notified: true,
      },
    });

    const notifications = reminders.map(
      (reminder) => ({
        id: reminder.id,
        title: reminder.title,
        remindAt: reminder.remindAt,
        type: reminder.type,
        screenshotId: reminder.screenshotId,
        memoryTitle:
          reminder.screenshot
            ?.extractedInformation?.title ||
          reminder.screenshot?.fileName ||
          null,
      })
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Notification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch notifications.",
      },
      { status: 500 }
    );
  }
}