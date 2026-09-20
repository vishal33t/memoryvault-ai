"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReminderList({
  initialReminders,
}) {
  const [reminders, setReminders] =
    useState(initialReminders);

  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createReminder(event) {
    event.preventDefault();

    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter a reminder title.");
      return;
    }

    if (!remindAt) {
      setMessage("Please select a date and time.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          remindAt: new Date(remindAt).toISOString(),
          type: "manual",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create reminder."
        );
      }

      setReminders((current) =>
        [...current, data.reminder].sort(
          (a, b) =>
            new Date(a.remindAt).getTime() -
            new Date(b.remindAt).getTime()
        )
      );

      setTitle("");
      setRemindAt("");

      setMessage(
        "Manual reminder created successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCompleted(reminder) {
    try {
      const response = await fetch(
        `/api/reminders/${reminder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !reminder.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update reminder."
        );
      }

      setReminders((current) =>
        current.map((item) =>
          item.id === reminder.id
            ? {
                ...item,
                completed:
                  data.reminder.completed,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  }

  async function deleteReminder(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/reminders/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete reminder."
        );
      }

      setReminders((current) =>
        current.filter(
          (reminder) => reminder.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  const upcoming = reminders.filter(
    (reminder) =>
      !reminder.completed &&
      new Date(reminder.remindAt) >= new Date()
  );

  const completed = reminders.filter(
    (reminder) => reminder.completed
  );

  return (
    <div>

      {/* Manual Reminder */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">
            Create Manual Reminder
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create a reminder for anything that does
            not have an automatic deadline.
          </p>
        </div>

        <form
          onSubmit={createReminder}
          className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_auto]"
        >
          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Buy headphones"
            className="rounded-xl border px-4 py-3 outline-none focus:border-black"
          />

          <input
            type="datetime-local"
            value={remindAt}
            onChange={(event) =>
              setRemindAt(event.target.value)
            }
            className="rounded-xl border px-4 py-3 outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Reminder"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>


      {/* Upcoming */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Upcoming Reminders
          </h2>

          <p className="text-sm text-gray-500">
            Automatic and manual reminders.
          </p>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <div className="text-4xl">
              ⏰
            </div>

            <h3 className="mt-4 font-semibold">
              No upcoming reminders
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Your reminders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={toggleCompleted}
                onDelete={deleteReminder}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </section>


      {/* Completed */}
      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">
            Completed
          </h2>

          <div className="grid gap-4">
            {completed.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={toggleCompleted}
                onDelete={deleteReminder}
                formatDate={formatDate}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}


function ReminderCard({
  reminder,
  onToggle,
  onDelete,
  formatDate,
}) {
  const memory = reminder.screenshot;
  const info = memory?.extractedInformation;

  const automatic =
    reminder.type === "automatic";

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        reminder.completed
          ? "opacity-60"
          : ""
      }`}
    >
      <div className="flex items-start gap-4">

        {/* Checkbox */}
        <button
          onClick={() =>
            onToggle(reminder)
          }
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${
            reminder.completed
              ? "bg-black text-white"
              : ""
          }`}
        >
          {reminder.completed
            ? "✓"
            : ""}
        </button>


        {/* Content */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold ${
                reminder.completed
                  ? "line-through"
                  : ""
              }`}
            >
              {reminder.title}
            </h3>

            {automatic ? (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                🤖 Automatic
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                👤 Manual
              </span>
            )}</div>
            {reminder.type === "automatic" ? (
  <p className="mt-1 text-xs text-gray-500">
    Automatically created from a detected deadline.
  </p>
) : (
  <p className="mt-1 text-xs text-gray-500">
    Created manually by you.
  </p>
)}
          


          <p className="mt-2 text-sm text-gray-500">
            ⏰ {formatDate(reminder.remindAt)}
          </p>


          {info?.title && (
            <p className="mt-2 text-xs text-gray-400">
              Related memory: {info.title}
            </p>
          )}


          {memory?.id && (
            <Link
              href={`/dashboard/memories/${memory.id}`}
              className="mt-3 inline-block text-sm font-medium hover:underline"
            >
              View memory →
            </Link>
          )}

        </div>


        {/* Delete */}
        <button
          onClick={() =>
            onDelete(reminder.id)
          }
          className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black"
        >
          Delete
        </button>

      </div>
    </div>
  );
}