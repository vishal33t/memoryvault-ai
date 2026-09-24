import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const toNumber = searchParams.get("to");
  const deadlineDate = searchParams.get("date");
  const deadlineTime = searchParams.get("time");

  const targetNumber = toNumber || process.env.TEST_WHATSAPP_NUMBER;
  // Let's use simpler test fallbacks that match sandbox numeric formats
  const dateStr = deadlineDate || "12/10/2026";
  const timeStr = deadlineTime || "10:00 AM";

  if (!targetNumber) {
    return NextResponse.json({ success: false, error: "Missing recipient 'to' parameter." }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${targetNumber}`,
      // Strict fallback layout matching Twilio Sandbox exact validation string
      body: "Your appointment is coming up on " + dateStr + " at " + timeStr,
    });

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
    });

  } catch (error) {
    console.error("WhatsApp Execution Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code || null,
      },
      { status: 500 }
    );
  }
}