import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { extractTextFromImage } from "@/services/ocrService";
import { analyzeText } from "@/services/aiService";
import { generateEmbedding } from "@/services/embeddingService";
import { saveEmbedding } from "@/services/embeddingDatabaseService";

// --------------------------------
// India timezone helpers
// --------------------------------

// Convert a YYYY-MM-DD date into a Date representing
// 11:59:59 PM on that date in India.
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

// Create an automatic reminder for 9:00 AM IST
// on the day before the deadline.
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

  // Start with 9:00 AM IST on the detected deadline date.
  const deadlineMorning = new Date(
    `${year}-${month}-${day}T09:00:00+05:30`
  );

  if (Number.isNaN(deadlineMorning.getTime())) {
    return null;
  }

  // One calendar day before the deadline.
  const reminderDate = new Date(deadlineMorning);
  reminderDate.setUTCDate(
    reminderDate.getUTCDate() - 1
  );

  return reminderDate;
}

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

    console.log(
      `Starting AI processing for memory: ${memory.id}`
    );

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
    // STEP 4: Prepare deadline
    // --------------------------------

    const deadlineDate = aiResult.deadline
      ? createIndiaDeadlineDate(aiResult.deadline)
      : null;

    const reminderDate = aiResult.deadline
      ? createIndiaReminderDate(aiResult.deadline)
      : null;

    if (aiResult.deadline) {
      console.log(
        "AI detected deadline:",
        aiResult.deadline
      );

      console.log(
        "Deadline stored as:",
        deadlineDate?.toISOString()
      );

      console.log(
        "Automatic reminder scheduled for:",
        reminderDate?.toISOString()
      );
    }

    // --------------------------------
    // STEP 5: Save screenshot result
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
    // STEP 6: Save extracted information
    // --------------------------------

    await prisma.extractedInformation.upsert({
      where: {
        screenshotId: memory.id,
      },

      update: {
        title: aiResult.title,
        summary: aiResult.summary,
        company: aiResult.company,
        role: aiResult.role,
        deadline: deadlineDate,
        location: aiResult.location,
        skills: aiResult.skills || [],
      },

      create: {
        screenshotId: memory.id,
        title: aiResult.title,
        summary: aiResult.summary,
        company: aiResult.company,
        role: aiResult.role,
        deadline: deadlineDate,
        location: aiResult.location,
        skills: aiResult.skills || [],
      },
    });
    
    // Generate semantic-search embedding
try {
  const searchableText = [
    aiResult.title,
    aiResult.summary,
    aiResult.company,
    aiResult.role,
    aiResult.location,
    ...(aiResult.skills || []),
  ]
    .filter(Boolean)
    .join(" ");

  if (searchableText.trim()) {
    console.log(
      "Generating semantic-search embedding..."
    );

    const embedding =
      await generateEmbedding(searchableText);

    await saveEmbedding(
      memory.id,
      embedding
    );

    console.log(
      "Semantic-search embedding saved successfully."
    );
  }
} catch (embeddingError) {
  console.error(
    "Embedding generation failed. Continuing without embedding:",
    embeddingError.message
  );
}

    // --------------------------------
    // STEP 7: Create automatic reminder
    // --------------------------------

    if (reminderDate) {
      // Only create the reminder if it is still in the future.
      if (reminderDate > new Date()) {
        const existingReminder =
          await prisma.reminder.findFirst({
            where: {
              userId: session.user.id,
              screenshotId: memory.id,
              type: "automatic",
            },
          });

        if (!existingReminder) {
          await prisma.reminder.create({
            data: {
              userId: session.user.id,
              screenshotId: memory.id,
              title: `Deadline: ${
                aiResult.title || memory.fileName
              }`,
              remindAt: reminderDate,
              type: "automatic",
            },
          });

          console.log(
            "Automatic reminder created successfully."
          );

          console.log(
            `Reminder time (IST): ${
              reminderDate.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              })
            }`
          );
        } else {
          console.log(
            "Automatic reminder already exists."
          );
        }
      } else {
        console.log(
          "Reminder date has already passed. No automatic reminder created."
        );
      }
    }

    // --------------------------------
    // STEP 8: Return result
    // --------------------------------

    return NextResponse.json({
      success: true,
      message:
        "OCR and AI analysis completed successfully.",
      extractedText,
      aiResult,
    });
  } catch (error) {
    console.error("OCR/AI error:", error);

    try {
      const { id } = await params;
      if (id) {
        await prisma.screenshot.update({
          where: { id },
          data: { status: "failed" },
        });
      }
    } catch (dbError) {
      console.error("Failed to update screenshot status to failed:", dbError);
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "OCR and AI processing failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}