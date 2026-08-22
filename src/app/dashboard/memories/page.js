import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserMemories } from "@/services/memoryService";
import Link from "next/link";

export default async function MemoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const memories = await getUserMemories(
    session.user.id
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              My Memories
            </h1>

            <p className="mt-2 text-gray-500">
              Everything you&apos;ve saved in MemoryVault.
            </p>
          </div>

          <Link
            href="/dashboard/upload"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            + Upload Screenshot
          </Link>
        </div>

        {memories.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold">
              No memories yet
            </h2>

            <p className="mt-2 text-gray-500">
              Upload your first screenshot to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Link
                key={memory.id}
                href={`/dashboard/memories/${memory.id}`}
                className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {memory.imageUrl ? (
                  <img
                    src={memory.imageUrl}
                    alt={memory.fileName}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gray-100">
                    Image unavailable
                  </div>
                )}

                <div className="p-5">
                  <p className="text-xs uppercase text-gray-500">
                    {memory.category || "Uncategorized"}
                  </p>

                  <h2 className="mt-2 font-semibold">
                    {memory.fileName}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(
                      memory.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}