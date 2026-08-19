export default function MemoryCard({
  title,
  category,
  description,
  deadline,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">
            {category}
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            {title}
          </h3>
        </div>

        {deadline && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
            Deadline
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        {description}
      </p>

      {deadline && (
        <p className="mt-4 text-sm font-medium">
          Deadline: {deadline}
        </p>
      )}
    </div>
  );
}