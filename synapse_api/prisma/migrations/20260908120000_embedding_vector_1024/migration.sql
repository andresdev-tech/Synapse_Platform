-- Qwen entrega embeddings de 1024 dimensiones.
-- Los chunks existentes no pueden reutilizarse porque fueron definidos con otra dimensión.
TRUNCATE TABLE "DocumentChunk";

ALTER TABLE "DocumentChunk"
  ALTER COLUMN "embedding" TYPE vector(1024)
  USING "embedding"::vector(1024);