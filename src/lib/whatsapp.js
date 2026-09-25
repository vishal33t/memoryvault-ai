import axios from "axios";

// 🛠️ Hardcoded fallbacks if process.env continues to cache incorrectly
const token = process.env.WHATSAPP_TOKEN || "EAAbbAUxFgLYBSkV7fBRaYUabAtZAHQcJpZBPeCbFuADADbsNmC8yjhvecTMT7vIQDZAaZAZC9WkWX5SviXT8vty8efeIcrHn6CN41LS3f3tD8tZA2o8oFoagN3sFr6CyEQKNbbxhZC6xHXCv8ZAGXYzDZCnO60NOSeTD4xx3qVFHYI0OlmbFNVNQ1ke03tnxyQhZAm0wZDZD";

/**
 * Sends a WhatsApp reminder using Meta Cloud API via Axios
 */
export async function sendReminderWhatsApp({ to, title, remindAt, memoryTitle }) {
  if (!to) {
    throw new Error("Recipient WhatsApp number is required.");
  }

  // Strip all non-digit characters (Meta expects clean formats like 916006419936)
  const cleanPhone = to.replace(/\D/g, "");
  
  // 🔥 HARDCODED DIRECT URL STRING: No syntax substitution errors possible!
  const url = "https://facebook.com";

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: "hello_world",
      language: {
        code: "en_US"
      }
    }
  };

  console.log(`Sending Meta WhatsApp message using Axios to: ${cleanPhone}`);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    const data = response.data;
    console.log("WhatsApp message sent successfully via Meta:", data.messages?.[0]?.id);

    return {
      sid: data.messages?.[0]?.id,
      status: "accepted",
    };
  } catch (error) {
    const metaError = error.response?.data?.error?.message || error.message;
    console.error("Meta API Request Failed:", metaError);
    throw new Error(metaError);
  }
}