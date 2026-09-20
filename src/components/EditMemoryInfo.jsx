"use client";

import { useState } from "react";

const categories = [
  {
    value: "job",
    label: "Job",
  },
  {
    value: "internship",
    label: "Internship",
  },
  {
    value: "course",
    label: "Course",
  },
  {
    value: "product",
    label: "Product",
  },
  {
    value: "event",
    label: "Event",
  },
  {
    value: "travel",
    label: "Travel",
  },
  {
    value: "research",
    label: "Research",
  },
  {
    value: "idea",
    label: "Idea",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function EditMemoryInfo({
  screenshotId,
  initialInfo,
  initialCategory,
}) {
  const [editing, setEditing] = useState(false);

  const [category, setCategory] = useState(
    initialCategory || "other"
  );

  const [title, setTitle] = useState(
    initialInfo?.title || ""
  );

  const [summary, setSummary] = useState(
    initialInfo?.summary || ""
  );

  const [company, setCompany] = useState(
    initialInfo?.company || ""
  );

  const [role, setRole] = useState(
    initialInfo?.role || ""
  );

  const [location, setLocation] = useState(
    initialInfo?.location || ""
  );

  const [deadline, setDeadline] = useState(
    initialInfo?.deadline
      ? new Date(initialInfo.deadline)
          .toISOString()
          .slice(0, 10)
      : ""
  );

  const [skills, setSkills] = useState(
    initialInfo?.skills?.join(", ") || ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const skillList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      const response = await fetch(
        `/api/memories/${screenshotId}/info`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            title,
            summary,
            company,
            role,
            location,
            deadline: deadline || null,
            skills: skillList,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update memory."
        );
      }

      setMessage(
        "Memory information updated successfully."
      );

      setEditing(false);

      // Refresh the server-rendered memory details
      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100"
        >
          ✏️ Edit Information
        </button>

        {message && (
          <p className="mt-3 text-sm text-green-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border bg-gray-50 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          Edit Memory Information
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Correct or update information extracted by AI.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5"
      >
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
          >
            {categories.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="memory-title"
            className="mb-2 block text-sm font-medium"
          >
            Title
          </label>

          <input
            id="memory-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Memory title"
          />
        </div>

        {/* Summary */}
        <div>
          <label
            htmlFor="memory-summary"
            className="mb-2 block text-sm font-medium"
          >
            Summary
          </label>

          <textarea
            id="memory-summary"
            value={summary}
            onChange={(event) =>
              setSummary(event.target.value)
            }
            rows={5}
            className="w-full resize-y rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Summary"
          />
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="memory-company"
            className="mb-2 block text-sm font-medium"
          >
            Company
          </label>

          <input
            id="memory-company"
            type="text"
            value={company}
            onChange={(event) =>
              setCompany(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Company"
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="memory-role"
            className="mb-2 block text-sm font-medium"
          >
            Role
          </label>

          <input
            id="memory-role"
            type="text"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Role"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="memory-location"
            className="mb-2 block text-sm font-medium"
          >
            Location
          </label>

          <input
            id="memory-location"
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Location"
          />
        </div>

        {/* Deadline */}
        <div>
          <label
            htmlFor="memory-deadline"
            className="mb-2 block text-sm font-medium"
          >
            Deadline
          </label>

          <input
            id="memory-deadline"
            type="date"
            value={deadline}
            onChange={(event) =>
              setDeadline(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label
            htmlFor="memory-skills"
            className="mb-2 block text-sm font-medium"
          >
            Skills
          </label>

          <input
            id="memory-skills"
            type="text"
            value={skills}
            onChange={(event) =>
              setSkills(event.target.value)
            }
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-500"
            placeholder="Java, Python, SQL"
          />

          <p className="mt-2 text-xs text-gray-400">
            Separate multiple skills with commas.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            disabled={saving}
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}