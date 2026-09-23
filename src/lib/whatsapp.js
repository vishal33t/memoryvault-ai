import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error(
    "Twilio credentials are not configured."
  );
}

const client = twilio(accountSid, authToken);

export async function sendReminderWhatsApp({
  to,
  title,
  remindAt,
  memoryTitle,
}) {
  if (!to) {
    throw new Error(
      "Recipient WhatsApp number is required."
    );
  }

  const formattedDate = new Date(
    remindAt
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    body: `🔔 MemoryVault AI Reminder

${title}

${
  memoryTitle
    ? `Memory: ${memoryTitle}\n`
    : ""
}Reminder time: ${formattedDate}

Open MemoryVault AI to view your saved memory.`,
  });

  return message;
}