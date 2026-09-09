import { gemini } from "@/lib/gemini";

const memorySchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [
        "job",
        "internship",
        "course",
        "product",
        "event",
        "travel",
        "research",
        "idea",
        "other",
      ],
    },

    title: {
      type: "string",
    },

    summary: {
      type: "string",
    },

    company: {
      type: ["string", "null"],
    },

    role: {
      type: ["string", "null"],
    },

    deadline: {
      type: ["string", "null"],
    },

    skills: {
      type: "array",
      items: {
        type: "string",
      },
    },

    location: {
      type: ["string", "null"],
    },
  },

  required: [
    "category",
    "title",
    "summary",
    "company",
    "role",
    "deadline",
    "skills",
    "location",
  ],
};

export async function analyzeText(text) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini attempt ${attempt}/${maxRetries}`);

      const response = await gemini.models.generateContent({
        model: "gemini-3.6-flash",

        contents: `
You are the AI analysis engine for MemoryVault AI.

Analyze the saved content below.

Extract only information that is supported by the content.

Do not invent information.

If a field is not available, return null.

Normalize deadlines to YYYY-MM-DD when possible.

CONTENT:

${text}
        `,

        config: {
          responseMimeType: "application/json",
          responseSchema: memorySchema,
        },
      });

      console.log("Gemini response received.");

      return JSON.parse(response.text);

    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.status || error.message
      );

      if (error.status === 503 && attempt < maxRetries) {
        const waitTime = attempt * 3000;

        console.log(
          `Gemini temporarily unavailable. Retrying in ${waitTime / 1000}s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, waitTime)
        );

      } else {
        throw error;
      }
    }
  }
}