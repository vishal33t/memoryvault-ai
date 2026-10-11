import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/services/embeddingService";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Please provide a search query." },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { success: false, message: "Search query is too long." },
        { status: 400 }
      );
    }

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

    if (category && category !== "all" && !allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category." },
        { status: 400 }
      );
    }

    const queryEmbedding = await generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    let memories;

    if (category && category !== "all") {
      memories = await prisma.$queryRaw`
        SELECT
          s."id",
          s."userId",
          s."imageUrl",
          s."fileName",
          s."createdAt",
          s."category",
          s."status",
          s."extractedText",
          e."id" AS "informationId",
          e."title",
          e."summary",
          e."company",
          e."role",
          e."deadline",
          e."location",
          e."skills",
          (e."embedding" <=> ${vectorString}::vector) AS "distance"
        FROM "Screenshot" AS s
        INNER JOIN "ExtractedInformation" AS e ON e."screenshotId" = s."id"
        WHERE s."userId" = ${session.user.id}
          AND s."category" = ${category}
          AND e."embedding" IS NOT NULL
        ORDER BY e."embedding" <=> ${vectorString}::vector ASC
        LIMIT 10
      `;
    } else {
      memories = await prisma.$queryRaw`
        SELECT
          s."id",
          s."userId",
          s."imageUrl",
          s."fileName",
          s."createdAt",
          s."category",
          s."status",
          s."extractedText",
          e."id" AS "informationId",
          e."title",
          e."summary",
          e."company",
          e."role",
          e."deadline",
          e."location",
          e."skills",
          (e."embedding" <=> ${vectorString}::vector) AS "distance"
        FROM "Screenshot" AS s
        INNER JOIN "ExtractedInformation" AS e ON e."screenshotId" = s."id"
        WHERE s."userId" = ${session.user.id}
          AND e."embedding" IS NOT NULL
        ORDER BY e."embedding" <=> ${vectorString}::vector ASC
        LIMIT 10
      `;
    }

    return NextResponse.json({
      success: true,
      query,
      count: memories.length,
      memories: memories.map((memory) => ({
        id: memory.id,
        userId: memory.userId,
        imageUrl: memory.imageUrl,
        fileName: memory.fileName,
        createdAt: memory.createdAt,
        category: memory.category,
        status: memory.status,
        extractedText: memory.extractedText,
        extractedInformation: {
          id: memory.informationId,
          title: memory.title,
          summary: memory.summary,
          company: memory.company,
          role: memory.role,
          deadline: memory.deadline,
          location: memory.location,
          skills: memory.skills,
        },
        distance: Number(memory.distance),
      })),
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to perform semantic search." },
      { status: 500 }
    );
  }
}

