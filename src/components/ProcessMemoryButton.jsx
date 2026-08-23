"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProcessMemoryButton({
  memoryId,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleProcess() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/screenshots/${memoryId}/ocr`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "OCR processing failed."
        );
        return;
      }

      setMessage("Text extracted successfully.");

      router.refresh();
    } catch (error) {
      console.error("OCR request error:", error);

      setMessage(
        "OCR request failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleProcess}
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Analyzing Screenshot..."
          : "Extract Text"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}