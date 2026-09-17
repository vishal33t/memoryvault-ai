import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <DashboardSidebar />

      <main className="ml-64 min-h-screen">
        <DashboardHeader />

        <div className="p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                Profile
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage your MemoryVault account.
              </p>
            </div>

            <ProfileForm
              initialName={user.name || ""}
              email={user.email}
              createdAt={user.createdAt.toISOString()}
            />
          </div>
        </div>
      </main>
    </div>
  );
}