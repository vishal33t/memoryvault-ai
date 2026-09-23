import { NextResponse } from "next/server";

import { sendReminderWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  try {
    const message = await sendReminderWhatsApp({
      to: process.env.TEST_WHATSAPP_NUMBER,
      title: "MemoryVault AI Test Reminder",
      remindAt: new Date(),
      memoryTitle: "WhatsApp Integration Test",
    });

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error(
      "WhatsApp test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}