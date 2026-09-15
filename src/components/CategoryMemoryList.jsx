"use client";

import Link from "next/link";

export default function CategoryMemoryList({
  memories = [],
  title,
  description,
}) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          {description}
        </p>
      </div>

      {/* Empty State */}
      {memories.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="text-4xl">📂</div>

          <h2 className="mt-4 text-xl font-semibold text-white">
            Nothing here yet
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Save a screenshot belonging to this category and
            MemoryVault AI will organize it here automatically.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Memory Grid */}
      {memories.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {memories.map((memory) => {
            const info = memory.extractedInformation;

            return (
              <Link
                key={memory.id}
                href={`/dashboard/memories/${memory.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-black">
                  <img
                    src={memory.imageUrl}
                    alt={info?.title || memory.fileName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Category */}
                  <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium capitalize text-white backdrop-blur">
                    {memory.category || "other"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-semibold text-white">
                    {info?.title || memory.fileName}
                  </h2>

                  {info?.company && (
                    <p className="mt-2 text-sm font-medium text-gray-300">
                      🏢 {info.company}
                    </p>
                  )}

                  {info?.role && (
                    <p className="mt-1 text-sm text-gray-400">
                      💼 {info.role}
                    </p>
                  )}

                  {info?.location && (
                    <p className="mt-1 text-sm text-gray-400">
                      📍 {info.location}
                    </p>
                  )}

                  {info?.deadline && (
                    <p className="mt-3 text-sm text-gray-300">
                      📅 Deadline:{" "}
                      {new Date(
                        info.deadline
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {/* Skills */}
                  {info?.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {info.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs capitalize text-gray-500">
                      {memory.status}
                    </span>

                    <span className="text-xs text-gray-400 transition group-hover:text-white">
                      View memory →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}