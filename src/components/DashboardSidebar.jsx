const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Inbox", icon: "📥" },
  { name: "Jobs", icon: "💼" },
  { name: "Internships", icon: "🎓" },
  { name: "Courses", icon: "📚" },
  { name: "Products", icon: "🛍️" },
  { name: "Events", icon: "📅" },
  { name: "Reminders", icon: "⏰" },
];

export default function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white md:block">
      <div className="border-b p-6">
        <h1 className="text-xl font-bold">
          MemoryVault AI
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Save anything. Forget nothing.
        </p>
      </div>

      <nav className="p-4">
        {navigation.map((item) => (
          <button
            key={item.name}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm hover:bg-gray-100"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}