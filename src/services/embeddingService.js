import { gemini } from "@/lib/gemini";

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSION = 3072;

export async function generateEmbedding(text) {
  if (!text || !text.trim()) {
    throw new Error(
      "Cannot generate embedding from empty text."
    );
  }

  try {
    console.log("Generating Gemini embedding...");

    const response = await gemini.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim(),
      config: {
        outputDimensionality: EMBEDDING_DIMENSION,
      },
    });

    const embedding =
      response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error(
        "Gemini returned an empty embedding."
      );
    }

    if (embedding.length !== EMBEDDING_DIMENSION) {
      throw new Error(
        `Unexpected embedding dimension. Expected ${EMBEDDING_DIMENSION}, received ${embedding.length}.`
      );
    }

    console.log(
      `Embedding generated successfully. Dimensions: ${embedding.length}`
    );

    return embedding;
  } catch (error) {
    console.error(
      "Embedding generation failed:",
      error.message
    );

    throw error;
  }
}