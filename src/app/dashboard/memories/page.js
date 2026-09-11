import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserMemories } from "@/services/memoryService";
import Link from "next/link";
import MemorySearch from "@/components/MemorySearch";

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

        {/* Header */}
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

        {/* Search + Memories */}
        <MemorySearch
          initialMemories={memories}
        />

      </div>
    </main>
  );
}