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

    const userId = session.user.id;

    // Total memories
    const totalMemories = await prisma.screenshot.count({
      where: {
        userId,
      },
    });

    // Processed memories
    const processedMemories = await prisma.screenshot.count({
      where: {
        userId,
        status: "processed",
      },
    });

    // Processing memories
    const processingMemories = await prisma.screenshot.count({
      where: {
        userId,
        status: "processing",
      },
    });

    // Uploaded/pending memories
    const pendingMemories = await prisma.screenshot.count({
      where: {
        userId,
        status: "uploaded",
      },
    });

    // Get all categories
    const categoryData = await prisma.screenshot.findMany({
      where: {
        userId,
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
    });

    // Count categories
    const categories = {};

    categoryData.forEach((item) => {
      const category = item.category;

      categories[category] =
        (categories[category] || 0) + 1;
    });

    return NextResponse.json({
      totalMemories,
      processedMemories,
      processingMemories,
      pendingMemories,
      categories,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}