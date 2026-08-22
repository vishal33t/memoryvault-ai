import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DeleteMemoryButton from "@/components/DeleteMemoryButton";

export default async function MemoryDetailPage({
  params,
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const memory = await prisma.screenshot.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!memory) {
    notFound();
  }

  const { data } = await supabase.storage
    .from("memory-images")
    .createSignedUrl(
      memory.fileName,
      60 * 60
    );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/memories"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Memories
        </Link>

        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          {data?.signedUrl && (
            <img
              src={data.signedUrl}
              alt={memory.fileName}
              className="max-h-[700px] w-full object-contain"
            />
          )}

          <div className="border-t p-6">
            <p className="text-sm uppercase text-gray-500">
              {memory.category || "Uncategorized"}
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              {memory.fileName}
            </h1>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="font-medium">
                  {memory.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Saved
                </p>

                <p className="font-medium">
                  {new Date(
                    memory.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-6">
    <DeleteMemoryButton memoryId={memory.id} />
  </div>
          </div>
        </div>
      </div>
    </main>
  );
}