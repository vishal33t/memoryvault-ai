import Link from "next/link";

export default function MemoryCard({ memory }) {
  return (
    <Link
      href={`/dashboard/memories/${memory.id}`}
      className="flex overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image */}
      <div className="h-32 w-32 shrink-0 bg-gray-100">
        {memory.imageUrl ? (
          <img
            src={memory.imageUrl}
            alt={memory.fileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          {memory.category || "Uncategorized"}
        </p>

        <h3 className="mt-1 font-semibold">
          {memory.fileName}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Saved{" "}
          {new Date(memory.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}