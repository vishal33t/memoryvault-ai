import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";

export default async function DashboardHeader() {
  const session = await auth();

  let userName = session?.user?.name || "User";

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        name: true,
      },
    });

    if (user?.name) {
      userName = user.name;
    }
  }

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-semibold">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Your personal memory space
        </p>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        <ProfileMenu
          userName={userName}
          initials={initials || "U"}
        />
      </div>
    </header>
  );
}