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

export async function PATCH(request, { params }) {
  try {
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

    const body = await request.json();

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

    let deadline = null;

    if (body.deadline) {
      const parsedDeadline = new Date(
        `${body.deadline}T00:00:00.000Z`
      );

      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid deadline.",
          },
          {
            status: 400,
          }
        );
      }

      deadline = parsedDeadline;
    }

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

    const updatedMemory = await prisma.screenshot.update({
      where: {
        id,
      },
      data: {
        category,
      },
    });

    const updatedInformation =
      await prisma.extractedInformation.upsert({
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

    return NextResponse.json({
      success: true,
      message: "Memory information updated successfully.",
      memory: updatedMemory,
      extractedInformation: updatedInformation,
    });
  } catch (error) {
    console.error("Update memory information error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update memory information.",
      },
      {
        status: 500,
      }
    );
  }
}