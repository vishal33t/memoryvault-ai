"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "job", label: "Jobs" },
  { value: "internship", label: "Internships" },
  { value: "course", label: "Courses" },
  { value: "product", label: "Products" },
  { value: "event", label: "Events" },
  { value: "travel", label: "Travel" },
  { value: "research", label: "Research" },
  { value: "idea", label: "Ideas" },
  { value: "other", label: "Other" },
];

const SEARCH_MODES = [
  {
    value: "keyword",
    label: "Keyword Search",
    description: "Find memories using matching words.",
  },
  {
    value: "semantic",
    label: "Semantic Search",
    description: "Find memories based on meaning.",
  },
  {
    value: "combined",
    label: "Combined Search",
    description: "Combine keyword and meaning-based results.",
  },
];

function formatDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function normalizeMemory(memory) {
  return {
    ...memory,
    imageUrl: String(memory.imageUrl || ""),
  };
}

function getMemoryTitle(memory) {
  return (
    memory.extractedInformation?.title ||
    memory.title ||
    memory.fileName ||
    "Untitled Memory"
  );
}

function getMemorySummary(memory) {
  return (
    memory.extractedInformation?.summary ||
    memory.summary ||
    ""
  );
}

function getMemoryCategory(memory) {
  return memory.category || "Uncategorized";
}

function mergeMemories(keywordMemories, semanticMemories) {
  const merged = [];
  const seenIds = new Set();

  // Keyword results come first.
  for (const memory of keywordMemories) {
    if (!seenIds.has(memory.id)) {
      seenIds.add(memory.id);
      merged.push(memory);
    }
  }

  // Add semantic results that aren't already included.
  for (const memory of semanticMemories) {
    if (!seenIds.has(memory.id)) {
      seenIds.add(memory.id);
      merged.push(memory);
    }
  }

  return merged;
}

export default function MemorySearch({ initialMemories }) {
  const [memories, setMemories] = useState(
    initialMemories.map(normalizeMemory)
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [searchMode, setSearchMode] = useState("keyword");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Prevent an older request from overwriting newer search results.
  const requestIdRef = useRef(0);

  useEffect(() => {
    // When all filters are cleared, restore server-provided memories.
    if (!query.trim() && category === "all") {
      requestIdRef.current += 1;

      setMemories(initialMemories.map(normalizeMemory));
      setLoading(false);
      setErrorMessage("");
      setHasSearched(false);

      return;
    }

    const timer = setTimeout(() => {
      searchMemories();
    }, 400);

    return () => clearTimeout(timer);

    // Search when query, category, or search mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, searchMode, initialMemories]);

  async function fetchKeywordResults(params) {
    const response = await fetch(
      `/api/memories/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Keyword search failed.");
    }

    const data = await response.json();

    return (data.memories || []).map(normalizeMemory);
  }

  async function fetchSemanticResults(params) {
    const response = await fetch(
      `/api/memories/semantic-search?${params.toString()}`
    );

    if (!response.ok) {
      let message = "Semantic search failed.";

      try {
        const data = await response.json();

        if (data.error) {
          message = data.error;
        }
      } catch {
        // Keep the default error message.
      }

      throw new Error(message);
    }

    const data = await response.json();

    return (data.memories || []).map((memory) => {
      // The semantic API returns extracted information as
      // top-level fields rather than a nested relation.
      return normalizeMemory({
        ...memory,
        extractedInformation: {
          id: memory.informationId,
          title: memory.title,
          summary: memory.summary,
          company: memory.company,
          role: memory.role,
          deadline: memory.deadline,
          location: memory.location,
          skills: memory.skills || [],
        },
      });
    });
  }

  async function searchMemories() {
    const trimmedQuery = query.trim();

    // Avoid sending an empty semantic query to the embedding API.
    // With no query, use keyword search to apply the category filter.
    const effectiveMode =
      !trimmedQuery && searchMode !== "keyword"
        ? "keyword"
        : searchMode;

    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setErrorMessage("");
      setHasSearched(true);

      const params = new URLSearchParams();

      if (trimmedQuery) {
        params.set("q", trimmedQuery);
      }

      if (category !== "all") {
        params.set("category", category);
      }

      let results = [];

      if (effectiveMode === "keyword") {
        results = await fetchKeywordResults(params);
      } else if (effectiveMode === "semantic") {
        results = await fetchSemanticResults(params);
      } else {
        // Combined search: run both searches concurrently.
        // If one fails, preserve the successful search results.
        const outcomes = await Promise.allSettled([
          fetchKeywordResults(params),
          fetchSemanticResults(params),
        ]);

        const keywordOutcome = outcomes[0];
        const semanticOutcome = outcomes[1];

        const keywordResults =
          keywordOutcome.status === "fulfilled"
            ? keywordOutcome.value
            : [];

        const semanticResults =
          semanticOutcome.status === "fulfilled"
            ? semanticOutcome.value
            : [];

        if (
          keywordOutcome.status === "rejected" &&
          semanticOutcome.status === "rejected"
        ) {
          throw new Error(
            "Both keyword and semantic search failed. Please try again."
          );
        }

        results = mergeMemories(
          keywordResults,
          semanticResults
        );

        if (keywordOutcome.status === "rejected") {
          console.error(
            "Keyword search failed:",
            keywordOutcome.reason
          );
        }

        if (semanticOutcome.status === "rejected") {
          console.error(
            "Semantic search failed:",
            semanticOutcome.reason
          );
        }
      }

      // Ignore results from an older request.
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setMemories(results);
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error("Memory search error:", error);

      setMemories([]);
      setErrorMessage(
        error.message || "Something went wrong while searching."
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      {/* Search Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Input and Category */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              🔍
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your saved memories..."
              aria-label="Search memories"
              className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 outline-none transition focus:border-black"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Mode */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Search method
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {SEARCH_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setSearchMode(mode.value)}
                aria-pressed={searchMode === mode.value}
                className={`rounded-xl border p-4 text-left transition ${
                  searchMode === mode.value
                    ? "border-black bg-gray-100 ring-1 ring-black"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <span className="block font-semibold text-gray-900">
                  {mode.label}
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>

          {searchMode === "semantic" && (
            <p className="mt-2 text-xs text-gray-500">
              Semantic search uses AI embeddings to find related
              content. Results depend on which memories have
              successfully generated embeddings.
            </p>
          )}

          {searchMode === "combined" && (
            <p className="mt-2 text-xs text-gray-500">
              Keyword results appear first, followed by additional
              semantic matches. Duplicate memories are removed.
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mb-4 text-sm text-gray-500" role="status">
          Searching your memories...
        </p>
      )}

      {/* Error */}
      {errorMessage && !loading && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <p className="font-medium">
            We couldn&apos;t complete your search.
          </p>

          <p className="mt-1">{errorMessage}</p>

          <button
            type="button"
            onClick={searchMemories}
            className="mt-3 rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results Count */}
      {!loading && !errorMessage && hasSearched && (
        <p className="mb-4 text-sm text-gray-500">
          {memories.length}{" "}
          {memories.length === 1 ? "memory" : "memories"} found
          {searchMode === "semantic" && query.trim()
            ? " using semantic search"
            : searchMode === "combined" && query.trim()
              ? " using combined search"
              : ""}
          .
        </p>
      )}

      {/* Results */}
      {!loading && memories.length === 0 && !errorMessage ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="text-4xl" aria-hidden="true">
            🔍
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            No memories found
          </h2>

          <p className="mt-2 text-gray-500">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        memories.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Link
                key={memory.id}
                href={`/dashboard/memories/${memory.id}`}
                className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {memory.imageUrl ? (
                  <div className="relative h-64 w-full bg-gray-100">
                    <Image
                      src={memory.imageUrl}
                      alt={memory.fileName || "Saved memory"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        console.error(
                          "Image failed to load:",
                          memory.id,
                          memory.imageUrl
                        );

                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gray-100 text-sm text-gray-500">
                    Image unavailable
                  </div>
                )}

                <div className="p-5">
                  <p className="text-xs uppercase text-gray-500">
                    {getMemoryCategory(memory)}
                  </p>

                  <h2 className="mt-2 font-semibold">
                    {getMemoryTitle(memory)}
                  </h2>

                  {getMemorySummary(memory) && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {getMemorySummary(memory)}
                    </p>
                  )}

                  {memory.extractedInformation?.company && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Company:</span>{" "}
                      {memory.extractedInformation.company}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    {formatDate(memory.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}