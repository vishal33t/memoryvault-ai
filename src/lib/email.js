import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail({
  to,
  title,
  remindAt,
  memoryTitle,
}) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  const formattedDate = new Date(remindAt).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `🔔 MemoryVault Reminder: ${title}`,
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        color: #111827;
      ">
        <h2>🔔 MemoryVault AI Reminder</h2>

        <p>
          Your reminder is due:
        </p>

        <div style="
          padding: 16px;
          border-radius: 10px;
          background: #f3f4f6;
          margin: 20px 0;
        ">
          <h3 style="margin-top: 0;">
            ${title}
          </h3>

          ${
            memoryTitle
              ? `<p><strong>Memory:</strong> ${memoryTitle}</p>`
              : ""
          }

          <p>
            <strong>Reminder time:</strong>
            ${formattedDate}
          </p>
        </div>

        <p>
          Open MemoryVault AI to view the related memory.
        </p>

        <p style="color: #6b7280; font-size: 13px;">
          This is an automated notification from MemoryVault AI.
        </p>
      </div>
    `,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result;
}