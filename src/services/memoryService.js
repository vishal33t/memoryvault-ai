import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function getUserMemories(userId) {
  const memories = await prisma.screenshot.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const memoriesWithUrls = await Promise.all(
    memories.map(async (memory) => {
      const { data, error } = await supabase.storage
        .from("memory-images")
        .createSignedUrl(memory.fileName, 60 * 60);

      if (error) {
        console.error("Signed URL error:", error);
      }

      return {
        ...memory,
        imageUrl: data?.signedUrl || null,
      };
    })
  );

  return memoriesWithUrls;
}