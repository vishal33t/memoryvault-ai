import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function GET(request) {
  try {
    // Protect the cron endpoint.
    const authHeader = request.headers.get("authorization");

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const now = new Date();

    // Find reminders that are due and whose email
    // has not been successfully sent yet.
    const reminders = await prisma.reminder.findMany({
      where: {
        remindAt: {
          lte: now,
        },
        completed: false,
        emailSent: false,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        screenshot: {
          include: {
            extractedInformation: true,
          },
        },
      },
      orderBy: {
        remindAt: "asc",
      },
      take: 50,
    });

    const results = [];

    for (const reminder of reminders) {
      try {
        const memoryTitle =
          reminder.screenshot?.extractedInformation?.title ||
          reminder.screenshot?.fileName ||
          null;

        await sendReminderEmail({
          to: reminder.user.email,
          title: reminder.title,
          remindAt: reminder.remindAt,
          memoryTitle,
        });

        await prisma.reminder.update({
          where: {
            id: reminder.id,
          },
          data: {
            emailSent: true,
          },
        });

        results.push({
          reminderId: reminder.id,
          status: "sent",
        });

        console.log(
          `Reminder email sent successfully: ${reminder.id}`
        );
      } catch (error) {
        console.error(
          `Failed to send reminder email: ${reminder.id}`,
          error
        );

        results.push({
          reminderId: reminder.id,
          status: "failed",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: reminders.length,
      results,
    });
  } catch (error) {
    console.error(
      "Reminder processor error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to process reminders.",
      },
      {
        status: 500,
      }
    );
  }
}