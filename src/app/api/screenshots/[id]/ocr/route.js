import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { extractTextFromImage } from "@/services/ocrService";

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

    console.log(`Starting OCR for memory: ${memory.id}`);

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

    const extractedText =
      await extractTextFromImage(imageBuffer);

    console.log("OCR completed.");

    await prisma.screenshot.update({
      where: {
        id: memory.id,
      },
      data: {
        extractedText,
        status: "processed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "OCR completed successfully.",
      extractedText,
    });
  } catch (error) {
    console.error("OCR error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "OCR processing failed.",
      },
      { status: 500 }
    );
  }
}