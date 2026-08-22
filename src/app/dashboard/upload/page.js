"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/screenshots/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        return;
      }

      setMessage("Screenshot uploaded successfully.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">
            Save a New Memory
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Upload a screenshot and MemoryVault will
            understand it later using AI.
          </p>

          <form
            onSubmit={handleUpload}
            className="mt-8 space-y-6"
          >
            <div className="rounded-xl border-2 border-dashed p-8 text-center">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="w-full"
              />

              <p className="mt-3 text-sm text-gray-500">
                PNG, JPG or WEBP • Maximum 5MB
              </p>
            </div>

            {preview && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Preview
                </p>

                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-h-96 w-full rounded-lg border object-contain"
                />
              </div>
            )}

            {message && (
              <p className="text-sm">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : "Save Screenshot"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}