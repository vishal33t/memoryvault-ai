import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import CategoryMemoryList from "@/components/CategoryMemoryList";

export default async function InternshipsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const memories = await prisma.screenshot.findMany({
    where: {
      userId: session.user.id,
      category: "internship",
    },
    include: {
      extractedInformation: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardSidebar />

      <main className="ml-64 min-h-screen">
        <DashboardHeader />

        <div className="p-8">
          <CategoryMemoryList
            memories={memories}
            title="Internships"
            description="AI-detected internship opportunities saved in your MemoryVault."
          />
        </div>
      </main>
    </div>
  );
}