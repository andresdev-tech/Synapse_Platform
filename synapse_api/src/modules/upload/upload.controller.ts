import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Configuración del cliente S3 para almacenamiento de archivos en la nube
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Controlador para la subida de archivos adjuntos (documentos, imágenes, etc.).
 * Recibe el archivo de la petición, genera un nombre único, lo carga en el bucket S3 / Neon Storage
 * y retorna la URL pública junto a los metadatos del archivo.
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file provided",
      });
    }

    const file = req.file;

    const bucketName =
      process.env.AWS_BUCKET_NAME ||
      "synapse-platform-storage";

    const fileExtension =
      file.originalname.split(".").pop()?.toLowerCase() || "bin";

    const uniqueFileName =
      `${crypto.randomUUID()}.${fileExtension}`;

    // Ruta dentro del bucket
    const objectKey =
      `systemdocs/${uniqueFileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Construcción de la URL pública de acceso al archivo
    const endpoint =
      (process.env.AWS_ENDPOINT_URL_S3 || "").replace(/\/$/, "");

    const fileUrl =
      `${endpoint}/${bucketName}/${objectKey}`;

    console.log("File uploaded successfully:", {
      bucket: bucketName,
      key: objectKey,
      url: fileUrl,
    });

    return res.status(200).json({
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      error: "Failed to upload file to S3",
    });
  }
};