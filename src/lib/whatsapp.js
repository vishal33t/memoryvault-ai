import axios from "axios";

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

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token) {
    throw new Error(
      "WHATSAPP_TOKEN is not configured."
    );
  }

  if (!phoneNumberId) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured."
    );
  }

  const cleanPhone = to.replace(/\D/g, "");

  const formattedDate = new Date(
    remindAt
  ).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const url =
    `https://graph.facebook.com/vXX.X/` +
    `${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",

    to: cleanPhone,

    type: "template",

    template: {
      name: "memoryvault_reminder",

      language: {
        code: "en_US",
      },

      components: [
        {
          type: "body",

          parameters: [
            {
              type: "text",
              text: title || "MemoryVault Reminder",
            },
            {
              type: "text",
              text: memoryTitle || "Saved Memory",
            },
            {
              type: "text",
              text: `${formattedDate} IST`,
            },
          ],
        },
      ],
    },
  };

  console.log(
    `Sending WhatsApp reminder to: ${cleanPhone}`
  );

  try {
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    console.log(
      "WhatsApp message sent successfully:",
      data.messages?.[0]?.id
    );

    return {
      sid: data.messages?.[0]?.id,
      status: "accepted",
    };
  } catch (error) {
    const metaError =
      error.response?.data?.error?.message ||
      error.message;

    console.error(
      "Meta WhatsApp API request failed:",
      metaError
    );

    throw new Error(metaError);
  }
}