import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderWhatsApp } from "@/lib/whatsapp";

export async function GET(request) {
  try {
    // ---------------------------------------
    // 1. Protect the cron endpoint
    // ---------------------------------------

    const authHeader = request.headers.get("authorization");

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    console.log(
      `Reminder processor started at ${now.toISOString()}`
    );

    // ---------------------------------------
    // 2. Find reminders that are due
    // ---------------------------------------

    const reminders = await prisma.reminder.findMany({
      where: {
        remindAt: {
          lte: now,
        },

        completed: false,

        OR: [
          {
            emailSent: false,
          },
          {
            whatsappSent: false,
          },
        ],
      },

      include: {
        user: {
          select: {
            email: true,
            name: true,
            phoneNumber: true,
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

    console.log(
      `Found ${reminders.length} reminder(s) to process.`
    );

    const results = [];

    // ---------------------------------------
    // 3. Process every reminder
    // ---------------------------------------

    for (const reminder of reminders) {
      const result = {
        reminderId: reminder.id,
        email: "not_processed",
        whatsapp: "not_processed",
      };

      const memoryTitle =
        reminder.screenshot?.extractedInformation?.title ||
        reminder.screenshot?.fileName ||
        null;

      // =======================================
      // EMAIL
      // =======================================

      if (!reminder.emailSent) {
        try {
          if (!reminder.user.email) {
            result.email = "skipped_no_email";
          } else {
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

            result.email = "sent";

            console.log(
              `Email sent for reminder ${reminder.id}`
            );
          }
        } catch (error) {
          result.email = "failed";

          console.error(
            `Email failed for reminder ${reminder.id}:`,
            error.message
          );
        }
      } else {
        result.email = "already_sent";
      }

      // =======================================
      // WHATSAPP
      // =======================================

      if (!reminder.whatsappSent) {
        try {
          if (!reminder.user.phoneNumber) {
            result.whatsapp = "skipped_no_phone";

            console.log(
              `WhatsApp skipped for reminder ${reminder.id}: no phone number`
            );
          } else {
            await sendReminderWhatsApp({
              to: reminder.user.phoneNumber,
              title: reminder.title,
              remindAt: reminder.remindAt,
              memoryTitle,
            });

            await prisma.reminder.update({
              where: {
                id: reminder.id,
              },

              data: {
                whatsappSent: true,
              },
            });

            result.whatsapp = "sent";

            console.log(
              `WhatsApp sent for reminder ${reminder.id}`
            );
          }
        } catch (error) {
          result.whatsapp = "failed";

          console.error(
            `WhatsApp failed for reminder ${reminder.id}:`,
            error.message
          );
        }
      } else {
        result.whatsapp = "already_sent";
      }

      results.push(result);
    }

    // ---------------------------------------
    // 4. Return processing result
    // ---------------------------------------

    return NextResponse.json({
      success: true,
      processed: reminders.length,
      processedAt: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error(
      "Reminder processor error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process reminders.",
      },
      {
        status: 500,
      }
    );
  }
}