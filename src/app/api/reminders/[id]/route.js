import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


// PATCH - Update reminder
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { message: "Reminder not found." },
        { status: 404 }
      );
    }

    const data = {};

    if (typeof body.completed === "boolean") {
      data.completed = body.completed;
    }

    if (body.title !== undefined) {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { message: "Title cannot be empty." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.remindAt !== undefined) {
      const reminderDate = new Date(body.remindAt);

      if (Number.isNaN(reminderDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid reminder date." },
          { status: 400 }
        );
      }

      data.remindAt = reminderDate;
    }

    const updatedReminder = await prisma.reminder.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Reminder updated successfully.",
      reminder: updatedReminder,
    });
  } catch (error) {
    console.error("Update reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reminder.",
      },
      { status: 500 }
    );
  }
}


// DELETE - Delete reminder
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { message: "Reminder not found." },
        { status: 404 }
      );
    }

    await prisma.reminder.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reminder error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete reminder.",
      },
      { status: 500 }
    );
  }
}