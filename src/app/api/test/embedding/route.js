import { NextResponse } from "next/server";
import { generateEmbedding } from "@/services/embeddingService";

export async function GET() {
  try {
    const text =
      "Java backend developer internship with Spring Boot and SQL.";

    const embedding =
      await generateEmbedding(text);

    return NextResponse.json({
      success: true,
      dimensions: embedding.length,
      firstValues: embedding.slice(0, 5),
    });
  } catch (error) {
    console.error(
      "Embedding test failed:",
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