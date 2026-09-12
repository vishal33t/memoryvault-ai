import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReminderList from "@/components/ReminderList";
import Link from "next/link";

export default async function RemindersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      screenshot: {
        include: {
          extractedInformation: true,
        },
      },
    },
    orderBy: {
      remindAt: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Reminders
            </h1>

            <p className="mt-2 text-gray-500">
              Never forget an important deadline again.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        <ReminderList
          initialReminders={JSON.parse(
            JSON.stringify(reminders)
          )}
        />

      </div>
    </main>
  );
}