import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";

export default function DashboardHeader() {
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

        <ProfileMenu />
      </div>
    </header>
  );
}