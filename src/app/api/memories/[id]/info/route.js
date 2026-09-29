import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedCategories = [
  "job",
  "internship",
  "course",
  "product",
  "event",
  "travel",
  "research",
  "idea",
  "other",
];

// --------------------------------
// India timezone helpers
// --------------------------------

// Create 11:59:59 PM IST on the given YYYY-MM-DD date.
function createIndiaDeadlineDate(dateString) {
  if (!dateString) {
    return null;
  }

  const match = String(dateString).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  const date = new Date(
    `${year}-${month}-${day}T23:59:59+05:30`
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// Create 9:00 AM IST one calendar day before deadline.
function createIndiaReminderDate(dateString) {
  if (!dateString) {
    return null;
  }

  const match = String(dateString).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  const deadlineMorning = new Date(
    `${year}-${month}-${day}T09:00:00+05:30`
  );

  if (Number.isNaN(deadlineMorning.getTime())) {
    return null;
  }

  const reminderDate = new Date(deadlineMorning);

  // One calendar day before.
  reminderDate.setUTCDate(
    reminderDate.getUTCDate() - 1
  );

  return reminderDate;
}

export async function PATCH(request, { params }) {
  try {
    // --------------------------------
    // STEP 1: Authentication
    // --------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    // --------------------------------
    // STEP 2: Verify memory ownership
    // --------------------------------

    const memory = await prisma.screenshot.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!memory) {
      return NextResponse.json(
        {
          message: "Memory not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------
    // STEP 3: Read request body
    // --------------------------------

    const body = await request.json();

    // --------------------------------
    // STEP 4: Validate fields
    // --------------------------------

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : null;

    const summary =
      typeof body.summary === "string"
        ? body.summary.trim()
        : null;

    const company =
      typeof body.company === "string" &&
      body.company.trim()
        ? body.company.trim()
        : null;

    const role =
      typeof body.role === "string" &&
      body.role.trim()
        ? body.role.trim()
        : null;

    const location =
      typeof body.location === "string" &&
      body.location.trim()
        ? body.location.trim()
        : null;

    const category =
      typeof body.category === "string"
        ? body.category
        : memory.category || "other";

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          message: "Invalid category.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // STEP 5: Validate deadline
    // --------------------------------

    let deadline = null;

    if (body.deadline) {
      const deadlineString = String(body.deadline);

      // Require YYYY-MM-DD.
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          deadlineString
        )
      ) {
        return NextResponse.json(
          {
            message: "Invalid deadline.",
          },
          {
            status: 400,
          }
        );
      }

      deadline =
        createIndiaDeadlineDate(deadlineString);

      if (!deadline) {
        return NextResponse.json(
          {
            message: "Invalid deadline.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------
    // STEP 6: Validate skills
    // --------------------------------

    let skills = [];

    if (Array.isArray(body.skills)) {
      skills = body.skills
        .filter(
          (skill) =>
            typeof skill === "string" &&
            skill.trim()
        )
        .map((skill) => skill.trim())
        .slice(0, 50);
    }

    // --------------------------------
    // STEP 7: Calculate automatic reminder
    // --------------------------------

    const reminderDate = body.deadline
      ? createIndiaReminderDate(
          String(body.deadline)
        )
      : null;

    // --------------------------------
    // STEP 8: Update everything atomically
    // --------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        // Get the current extracted information
        // before updating it.
        const existingInformation =
          await tx.extractedInformation.findUnique({
            where: {
              screenshotId: id,
            },
          });

        // Find only the AUTOMATIC reminder.
        //
        // Manual reminders are deliberately ignored.
        const existingAutomaticReminder =
          await tx.reminder.findFirst({
            where: {
              screenshotId: id,
              userId: session.user.id,
              type: "automatic",
            },
          });

        // --------------------------------
        // Update screenshot category
        // --------------------------------

        const updatedMemory =
          await tx.screenshot.update({
            where: {
              id,
            },
            data: {
              category,
            },
          });

        // --------------------------------
        // Update extracted information
        // --------------------------------

        const updatedInformation =
          await tx.extractedInformation.upsert({
            where: {
              screenshotId: id,
            },

            create: {
              screenshotId: id,
              title,
              summary,
              company,
              role,
              deadline,
              location,
              skills,
            },

            update: {
              title,
              summary,
              company,
              role,
              deadline,
              location,
              skills,
            },
          });

        // --------------------------------
        // Determine whether deadline changed
        // --------------------------------

        const oldDeadlineTime =
          existingInformation?.deadline
            ? existingInformation.deadline.getTime()
            : null;

        const newDeadlineTime =
          deadline
            ? deadline.getTime()
            : null;

        const deadlineChanged =
          oldDeadlineTime !== newDeadlineTime;

        // --------------------------------
        // Synchronize automatic reminder
        // --------------------------------

        if (deadlineChanged) {
          // --------------------------------
          // Case 1:
          // Deadline removed
          // --------------------------------

          if (!deadline || !reminderDate) {
            if (existingAutomaticReminder) {
              await tx.reminder.delete({
                where: {
                  id: existingAutomaticReminder.id,
                },
              });

              console.log(
                `Deleted automatic reminder for memory ${id}`
              );
            }
          }

          // --------------------------------
          // Case 2:
          // Deadline exists
          // --------------------------------
          else {
            const now = new Date();

            // Only keep the reminder if the
            // reminder time is still in future.
            if (reminderDate > now) {
              const reminderTitle =
                `Deadline: ${
                  title ||
                  existingInformation?.title ||
                  memory.fileName
                }`;

              if (existingAutomaticReminder) {
                await tx.reminder.update({
                  where: {
                    id: existingAutomaticReminder.id,
                  },

                  data: {
                    title: reminderTitle,
                    remindAt: reminderDate,

                    // Reset notification state because
                    // this is now a new reminder schedule.
                    completed: false,
                    notified: false,
                    emailSent: false,
                    whatsappSent: false,
                  },
                });

                console.log(
                  `Updated automatic reminder for memory ${id}`
                );
              } else {
                await tx.reminder.create({
                  data: {
                    userId: session.user.id,
                    screenshotId: id,
                    title: reminderTitle,
                    remindAt: reminderDate,
                    type: "automatic",

                    completed: false,
                    notified: false,
                    emailSent: false,
                    whatsappSent: false,
                  },
                });

                console.log(
                  `Created automatic reminder for memory ${id}`
                );
              }
            }

            // --------------------------------
            // Case 3:
            // Deadline exists but reminder time
            // has already passed
            // --------------------------------
            else {
              if (existingAutomaticReminder) {
                await tx.reminder.delete({
                  where: {
                    id: existingAutomaticReminder.id,
                  },
                });

                console.log(
                  `Deleted outdated automatic reminder for memory ${id}`
                );
              }
            }
          }
        }

        return {
          updatedMemory,
          updatedInformation,
        };
      }
    );

    // --------------------------------
    // STEP 9: Return response
    // --------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Memory information updated successfully.",
      memory: result.updatedMemory,
      extractedInformation:
        result.updatedInformation,
    });
  } catch (error) {
    console.error(
      "Update memory information error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update memory information.",
      },
      {
        status: 500,
      }
    );
  }
}