import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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

    // Ruta REAL dentro del bucket
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

    // ==========================================================
    // URL PÚBLICA DE NEON STORAGE
    // ==========================================================

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