"use client";

import { useState } from "react";

export default function CreateReminderButton({
  screenshotId,
  defaultTitle = "",
  defaultDate = "",
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [remindAt, setRemindAt] = useState(defaultDate);
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
          screenshotId,
          type: "manual",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create reminder."
        );
      }

      setMessage("Reminder created successfully.");
      setShowForm(false);
    } catch (error) {
      console.error("Create reminder error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Create Reminder
        </button>
      )}

      {showForm && (
        <form
          onSubmit={createReminder}
          className="mt-4 rounded-xl border bg-gray-50 p-4"
        >
          <h3 className="font-semibold">
            Create Manual Reminder
          </h3>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Reminder title"
            className="mt-4 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-black"
          />

          <input
            type="datetime-local"
            value={remindAt}
            onChange={(event) =>
              setRemindAt(event.target.value)
            }
            className="mt-3 w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-black"
          />

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Reminder"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p className="mt-3 text-sm text-gray-600">
              {message}
            </p>
          )}
        </form>
      )}

      {!showForm && message && (
        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}