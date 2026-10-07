import { prisma } from "@/lib/prisma";

export async function saveEmbedding(
  screenshotId,
  embedding
) {
  if (!screenshotId) {
    throw new Error(
      "Screenshot ID is required."
    );
  }

  if (
    !Array.isArray(embedding) ||
    embedding.length !== 3072
  ) {
    throw new Error(
      `Invalid embedding. Expected 3072 numbers, received ${
        embedding?.length || 0
      }.`
    );
  }

  const vectorString = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    UPDATE "ExtractedInformation"
    SET "embedding" = ${vectorString}::vector
    WHERE "screenshotId" = ${screenshotId}
  `;

  console.log(
    `Embedding saved for screenshot: ${screenshotId}`
  );
}