import { NextResponse } from "next/server";
import { sendReminderWhatsApp } from "@/lib/whatsapp";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const to = searchParams.get("to") || process.env.TEST_WHATSAPP_NUMBER;
    const date = searchParams.get("date") || "25 September 2026";
    const time = searchParams.get("time") || "10:00 AM";

    if (!to) {
      return NextResponse.json(
        { success: false, error: "WhatsApp recipient is required." },
        { status: 400 }
      );
    }

    // Combine date and time for parsing or log purposes
    const remindAt = new Date(`${date} ${time}`);

    console.log("Triggering Meta WhatsApp Test Route Execution...");

    const messageResult = await sendReminderWhatsApp({
      to,
      title: "Appointment Reminder",
      remindAt,
      memoryTitle: "Upcoming Schedule",
    });

    return NextResponse.json({
      success: true,
      messageSid: messageResult.sid,
      status: messageResult.status,
      to,
      note: "Using Meta sandbox 'hello_world' template restriction.",
    });
  } catch (error) {
    console.error("WhatsApp test route failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
