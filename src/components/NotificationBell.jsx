"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] =
    useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const response = await fetch(
        "/api/notifications"
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setNotifications(
        data.notifications || []
      );
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white text-lg hover:bg-gray-50"
        aria-label="Notifications"
      >
        🔔

        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">
              Notifications
            </h3>

            <span className="text-xs text-gray-400">
              {notifications.length}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-3xl">
                🔔
              </div>

              <p className="mt-3 text-sm text-gray-500">
                No new notifications.
              </p>
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {notifications.map(
                (notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function NotificationItem({
  notification,
}) {
  const memoryUrl =
    notification.screenshotId
      ? `/dashboard/memories/${notification.screenshotId}`
      : "/dashboard/reminders";

  return (
    <Link
      href={memoryUrl}
      className="block rounded-xl border bg-gray-50 p-3 transition hover:bg-gray-100"
    >
      <div className="flex gap-3">
        <div className="text-lg">
          {notification.type ===
          "automatic"
            ? "🤖"
            : "👤"}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">
            {notification.title}
          </p>

          {notification.memoryTitle && (
            <p className="mt-1 line-clamp-1 text-xs text-gray-500">
              {notification.memoryTitle}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-400">
            Reminder is due.
          </p>
        </div>
      </div>
    </Link>
  );
}