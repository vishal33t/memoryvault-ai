"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
    >
      🚪 Logout
    </button>
  );
}