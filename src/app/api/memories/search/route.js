import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get logged-in user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    // Build database filters
    const where = {
      userId: session.user.id,
    };

    // Category filter
    if (category && category !== "all") {
      where.category = category;
    }

    // Search filter
    if (query.trim()) {
      where.OR = [
        {
          extractedText: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          extractedInformation: {
            is: {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          extractedInformation: {
            is: {
              company: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          extractedInformation: {
            is: {
              role: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          extractedInformation: {
            is: {
              summary: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const memories = await prisma.screenshot.findMany({
      where,

      include: {
        extractedInformation: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      memories,
    });

  } catch (error) {
    console.error("Memory search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search memories.",
      },
      { status: 500 }
    );
  }
}