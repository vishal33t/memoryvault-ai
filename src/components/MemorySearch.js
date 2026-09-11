"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function MemorySearch({ initialMemories }) {
  const [memories, setMemories] = useState(initialMemories);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't search when the page first loads.
    // The server has already provided the initial memories.
    if (!query.trim() && category === "all") {
      setMemories(initialMemories);
      return;
    }

    const timer = setTimeout(() => {
      searchMemories();
    }, 400);

    return () => clearTimeout(timer);
  }, [query, category, initialMemories]);

  async function searchMemories() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (category !== "all") {
        params.set("category", category);
      }

      const response = await fetch(
        `/api/memories/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      setMemories(data.memories || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search Controls */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search memories..."
            className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 outline-none transition focus:border-black"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="all">All Categories</option>
          <option value="job">Jobs</option>
          <option value="internship">Internships</option>
          <option value="course">Courses</option>
          <option value="product">Products</option>
          <option value="event">Events</option>
          <option value="travel">Travel</option>
          <option value="research">Research</option>
          <option value="idea">Ideas</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mb-4 text-sm text-gray-500">
          Searching...
        </p>
      )}

      {/* Results */}
      {memories.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="text-4xl">🔍</div>

          <h2 className="mt-4 text-xl font-semibold">
            No memories found
          </h2>

          <p className="mt-2 text-gray-500">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <Link
              key={memory.id}
              href={`/dashboard/memories/${memory.id}`}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {memory.imageUrl ? (
                <img
                  src={memory.imageUrl}
                  alt={memory.fileName}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-gray-100">
                  Image unavailable
                </div>
              )}

              <div className="p-5">
                <p className="text-xs uppercase text-gray-500">
                  {memory.category || "Uncategorized"}
                </p>

                <h2 className="mt-2 font-semibold">
                  {memory.extractedInformation?.title ||
                    memory.fileName}
                </h2>

                {memory.extractedInformation?.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {memory.extractedInformation.summary}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  {formatDate(memory.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}