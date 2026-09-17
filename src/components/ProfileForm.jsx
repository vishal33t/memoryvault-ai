"use client";

import { useState } from "react";

export default function ProfileForm({
  initialName,
  email,
  createdAt,
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      setName(data.user.name);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const formattedDate = new Date(
    createdAt
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">
      {/* Avatar */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
          {name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            {name || "User"}
          </h2>

          <p className="text-sm text-gray-500">
            MemoryVault Account
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={100}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-gray-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-500"
          />

          <p className="mt-2 text-xs text-gray-400">
            Email changes will require account verification.
          </p>
        </div>

        {/* Account Created */}
        <div>
          <p className="mb-2 text-sm font-medium">
            Account created
          </p>

          <p className="rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {formattedDate}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}