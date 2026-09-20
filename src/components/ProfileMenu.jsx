"use client";

import { useState } from "react";
import Link from "next/link";

import LogoutButton from "@/components/LogoutButton";

export default function ProfileMenu({
  userName,
  initials,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Avatar */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 font-semibold transition hover:bg-gray-300"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border bg-white shadow-lg">
          {/* User information */}
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {userName}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              MemoryVault Account
            </p>
          </div>

          {/* Actions */}
          <div className="p-2">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              👤 Profile
            </Link>

            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}