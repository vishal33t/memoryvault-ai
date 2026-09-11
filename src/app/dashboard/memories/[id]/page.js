import { notFound } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MemoryDetailsPage({ params }) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;

  const memory = await prisma.screenshot.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      extractedInformation: true,
    },
  });

  if (!memory) {
    notFound();
  }

  const info = memory.extractedInformation;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <Link
          href="/dashboard/memories"
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Memories
        </Link>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* Image */}
          <div className="border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
            <img
              src={memory.imageUrl}
              alt={info?.title || "Saved memory"}
              className="mx-auto max-h-[600px] max-w-full object-contain"
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">

            {/* Header */}
            <div className="mb-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">

                {memory.category && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {memory.category}
                  </span>
                )}

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {memory.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {info?.title || "Untitled Memory"}
              </h1>
            </div>

            {/* Summary */}
            {info?.summary && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Summary
                </h2>

                <p className="leading-7 text-gray-600 dark:text-gray-300">
                  {info.summary}
                </p>
              </section>
            )}

            {/* Information Grid */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Extracted Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* Company */}
                <InfoCard
                  label="Company"
                  value={info?.company}
                />

                {/* Role */}
                <InfoCard
                  label="Role"
                  value={info?.role}
                />

                {/* Deadline */}
                <InfoCard
                  label="Deadline"
                  value={
                    info?.deadline
                      ? new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(info.deadline))
                      : null
                  }
                />

                {/* Location */}
                <InfoCard
                  label="Location"
                  value={info?.location}
                />

              </div>
            </section>

            {/* Skills */}
            {info?.skills?.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Skills
                </h2>

                <div className="flex flex-wrap gap-2">
                  {info.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* OCR Text */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Extracted Text
              </h2>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {memory.extractedText || "No text extracted."}
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}


/*
 * Small reusable component for displaying
 * extracted information.
 */
function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="font-medium text-gray-900 dark:text-white">
        {value || "Not available"}
      </p>
    </div>
  );
}