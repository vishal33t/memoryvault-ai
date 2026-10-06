CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ExtractedInformation"
ADD COLUMN "embedding" vector(3072);