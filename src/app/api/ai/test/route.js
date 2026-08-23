import { NextResponse } from "next/server";
import { analyzeText } from "@/services/aiService";

export async function GET() {
  try {
    const sampleText = `
Google Summer Internship 2027

Software Engineer Intern

Skills:
Java
Python
DSA

Deadline:
15 January 2027

Apply at:
careers.google.com/students
`;

    const result = await analyzeText(sampleText);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gemini test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gemini test failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}