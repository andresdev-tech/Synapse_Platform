import { ExtractRepository } from "./extract.repository";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export class ExtractService {
  static async extractImageFromUrl(
    url: string
  ): Promise<string | null> {
    // ============================================================
    // 1. NEON STORAGE
    // ============================================================
    try {
      const neonEndpoint = (
        process.env.AWS_ENDPOINT_URL_S3 || ""
      ).replace(/\/$/, "");

      const bucketName =
        process.env.AWS_BUCKET_NAME ||
        "synapse-platform-storage";

      if (neonEndpoint && url.startsWith(neonEndpoint)) {
        const urlPath = url.slice(
          `${neonEndpoint}/`.length
        );

        // La URL de Neon usa:
        // /bucket/key
        //
        // Ejemplo:
        // /synapse-platform-storage/systemdocs/archivo.png

        const bucketPrefix = `${bucketName}/`;

        if (!urlPath.startsWith(bucketPrefix)) {
          console.error(
            "La URL de Neon no contiene el bucket esperado:",
            {
              url,
              bucketName,
              urlPath,
            }
          );

          return null;
        }

        // Removemos únicamente:
        // synapse-platform-storage/
        //
        // Resultado:
        // systemdocs/archivo.png
        const objectKey = urlPath.slice(
          bucketPrefix.length
        );

        console.log("Neon Storage:", {
          bucket: bucketName,
          key: objectKey,
        });

        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        });

        const signedUrl = await getSignedUrl(
          s3,
          command,
          {
            expiresIn: 3600,
          }
        );

        return signedUrl;
      }
    } catch (error) {
      console.error(
        "Error al generar presigned URL para S3:",
        error
      );
    }

    // ============================================================
    // 2. SCRAPING NORMAL
    // ============================================================
    try {
      const response =
        await ExtractRepository.fetchResource(url);

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.startsWith("image/")) {
        return url;
      }

      if (contentType.startsWith("text/html")) {
        const html = await response.text();

        const match =
          html.match(
            /og:image.*?content=["']([^"']+)["']/i
          ) ||
          html.match(
            /featuredImage['":\s]+([^'"]+)/i
          );

        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (error) {
      console.error(
        "Error fetching resource in ExtractService:",
        error
      );
    }

    return null;
  }
}