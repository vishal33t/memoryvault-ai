import Link from "next/link";
import { navigationItems } from "@/lib/navigation";

export default function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white md:block">
      {/* Logo / Header */}
      <div className="border-b p-6">
        <h1 className="text-xl font-bold">
          MemoryVault AI
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Save anything. Forget nothing.
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm hover:bg-gray-100"
          >
            <span>{item.icon}</span>

            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}