import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { extractTextFromImage } from "@/services/ocrService";
import { analyzeText } from "@/services/aiService";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
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
        { message: "Memory not found." },
        { status: 404 }
      );
    }

    await prisma.screenshot.update({
      where: {
        id: memory.id,
      },
      data: {
        status: "processing",
      },
    });

    console.log(`Starting AI processing for memory: ${memory.id}`);

    // --------------------------------
    // STEP 1: Download image
    // --------------------------------

    const { data, error } = await supabase.storage
      .from("memory-images")
      .download(memory.fileName);

    if (error || !data) {
      throw new Error(
        `Image download failed: ${
          error?.message || "No image data"
        }`
      );
    }

    console.log("Image downloaded successfully.");

    const imageBuffer = Buffer.from(
      await data.arrayBuffer()
    );

    console.log(
      `Image buffer created: ${imageBuffer.length} bytes`
    );

    // --------------------------------
    // STEP 2: OCR
    // --------------------------------

    const extractedText =
      await extractTextFromImage(imageBuffer);

    console.log("OCR completed.");

    console.log(
      `Extracted text length: ${extractedText.length}`
    );

    // --------------------------------
    // STEP 3: Gemini AI
    // --------------------------------

    console.log("Starting Gemini analysis...");

    const aiResult = await analyzeText(extractedText);

    console.log("Gemini analysis completed.");
    console.log("AI Result:", aiResult);

    // --------------------------------
    // STEP 4: Save result
    // --------------------------------

    await prisma.screenshot.update({
      where: {
        id: memory.id,
      },
      data: {
        extractedText,
        category: aiResult.category,
        status: "processed",
      },
    });

    // --------------------------------
    // STEP 5: Return result
    // --------------------------------

    return NextResponse.json({
      success: true,
      message: "OCR and AI analysis completed successfully.",
      extractedText,
      aiResult,
    });
  } catch (error) {
    console.error("OCR/AI error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "OCR and AI processing failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}