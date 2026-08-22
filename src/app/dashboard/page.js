import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserMemories } from "@/services/memoryService";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import MemoryCard from "@/components/MemoryCard";

export default async function Dashboard() {
  // 1. Get logged-in user
  const session = await auth();

  // 2. If user is not logged in, send them to login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 3. Get this user's memories from database
  const memories = await getUserMemories(session.user.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6">
          <div className="mx-auto max-w-7xl">

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Good evening 👋
              </h1>

              <p className="mt-2 text-gray-500">
                Here is what&apos;s happening in your MemoryVault.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Saved Memories"
                value={memories.length}
                description="Total screenshots saved"
              />

              <StatCard
                title="Opportunities"
                value="0"
                description="Jobs and internships"
              />

              <StatCard
                title="Upcoming"
                value="0"
                description="Deadlines approaching"
              />
            </div>

            {/* Recent Memories */}
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Recent Memories
                  </h2>

                  <p className="text-sm text-gray-500">
                    Recently saved information
                  </p>
                </div>

                <a
                  href="/dashboard/memories"
                  className="text-sm font-medium hover:underline"
                >
                  View all →
                </a>
              </div>

              {memories.length === 0 ? (
                /* Empty State */
                <div className="rounded-xl border bg-white p-10 text-center">
                  <div className="text-4xl">
                    🧠
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    No memories yet
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Upload your first screenshot to start
                    building your personal memory vault.
                  </p>

                  <a
                    href="/dashboard/upload"
                    className="mt-5 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Upload Screenshot
                  </a>
                </div>
              ) : (
                /* Memory List */
                <div className="grid gap-4">
                  {memories.slice(0, 5).map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}