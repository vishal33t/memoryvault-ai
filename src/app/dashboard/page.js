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

  // 3. Get this user's memories
  const memories = await getUserMemories(session.user.id);

  // -----------------------------------------
  // DASHBOARD STATISTICS
  // -----------------------------------------

  // Total memories
  const totalMemories = memories.length;

  // Jobs + internships
  const opportunities = memories.filter(
    (memory) =>
      memory.category === "job" ||
      memory.category === "internship"
  ).length;

  // Processed memories
  const processedMemories = memories.filter(
    (memory) => memory.status === "processed"
  ).length;

  // Pending memories
  const pendingMemories = memories.filter(
    (memory) =>
      memory.status === "uploaded" ||
      memory.status === "processing"
  ).length;

  // Upcoming deadlines
  const upcomingDeadlines = memories.filter((memory) => {
    const deadline = memory.extractedInformation?.deadline;

    if (!deadline) {
      return false;
    }

    const deadlineDate = new Date(deadline);
    const today = new Date();

    // Deadline must be in the future
    return deadlineDate >= today;
  }).length;

  // -----------------------------------------
  // CATEGORY COUNTS
  // -----------------------------------------

  const categoryCounts = {};

  memories.forEach((memory) => {
    if (!memory.category) {
      return;
    }

    categoryCounts[memory.category] =
      (categoryCounts[memory.category] || 0) + 1;
  });

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
            <div className="grid gap-4 md:grid-cols-4">

              <StatCard
                title="Saved Memories"
                value={totalMemories}
                description="Total screenshots saved"
              />

              <StatCard
                title="Opportunities"
                value={opportunities}
                description="Jobs and internships"
              />

              <StatCard
                title="Upcoming"
                value={upcomingDeadlines}
                description="Deadlines approaching"
              />

              <StatCard
                title="Processed"
                value={processedMemories}
                description={`${pendingMemories} still processing`}
              />

            </div>

            {/* Category Overview */}
            {Object.keys(categoryCounts).length > 0 && (
              <section className="mt-10">

                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    Memory Categories
                  </h2>

                  <p className="text-sm text-gray-500">
                    How your saved memories are organized
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {Object.entries(categoryCounts).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="rounded-xl border bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">

                          <span className="text-sm font-medium capitalize text-gray-500">
                            {category}
                          </span>

                          <span className="text-2xl font-bold">
                            {count}
                          </span>

                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-black"
                            style={{
                              width: `${Math.min(
                                (count / totalMemories) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}

                </div>
              </section>
            )}

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