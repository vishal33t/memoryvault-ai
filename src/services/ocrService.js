import path from "path";
import { createWorker } from "tesseract.js";

export async function extractTextFromImage(imageBuffer) {
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "tesseract.js",
    "src",
    "worker-script",
    "node",
    "index.js"
  );

  console.log("Tesseract worker path:", workerPath);

  const worker = await createWorker("eng", 1, {
    workerPath,

    logger: (message) => {
      console.log(
        `[OCR] ${message.status}: ${Math.round(
          (message.progress || 0) * 100
        )}%`
      );
    },
  });

  try {
    const result = await worker.recognize(imageBuffer);

    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}