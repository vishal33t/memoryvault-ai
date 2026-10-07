import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/services/embeddingService";
import { saveEmbedding } from "@/services/embeddingDatabaseService";

export async function GET() {
  try {
    const memory =
      await prisma.extractedInformation.findFirst({
        select: {
          screenshotId: true,
          title: true,
          summary: true,
          company: true,
          role: true,
          location: true,
          skills: true,
        },
      });

    if (!memory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No extracted information found. Process at least one screenshot first.",
        },
        { status: 404 }
      );
    }

    const searchableText = [
      memory.title,
      memory.summary,
      memory.company,
      memory.role,
      memory.location,
      ...(memory.skills || []),
    ]
      .filter(Boolean)
      .join(" ");

    console.log(
      "Generating embedding for:",
      searchableText
    );

    const embedding =
      await generateEmbedding(searchableText);

    await saveEmbedding(
      memory.screenshotId,
      embedding
    );

    return NextResponse.json({
      success: true,
      screenshotId: memory.screenshotId,
      dimensions: embedding.length,
      searchableText,
    });
  } catch (error) {
    console.error(
      "Save embedding test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}