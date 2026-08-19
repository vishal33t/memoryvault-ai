import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import MemoryCard from "@/components/MemoryCard";

const memories = [
  {
    title: "Google Summer Internship",
    category: "Internship",
    description:
      "Software engineering internship requiring Java, Python and DSA skills.",
    deadline: "15 January 2027",
  },
  {
    title: "Machine Learning Course",
    category: "Course",
    description:
      "Complete beginner-friendly machine learning course with practical projects.",
    deadline: null,
  },
  {
    title: "MacBook Air M4",
    category: "Product",
    description:
      "Laptop deal saved for future purchase comparison.",
    deadline: null,
  },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Good evening 👋
              </h1>

              <p className="mt-2 text-gray-500">
                Here is what&apos;s happening in your MemoryVault.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Saved Memories"
                value="24"
                description="Total screenshots saved"
              />

              <StatCard
                title="Opportunities"
                value="8"
                description="Jobs and internships"
              />

              <StatCard
                title="Upcoming"
                value="5"
                description="Deadlines approaching"
              />
            </div>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Recent Memories
                </h2>

                <p className="text-sm text-gray-500">
                  Recently saved information
                </p>
              </div>

              <div className="grid gap-4">
                {memories.map((memory) => (
                  <MemoryCard
                    key={memory.title}
                    {...memory}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}