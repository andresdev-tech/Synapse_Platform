import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  endpoint: process.env.AWS_ENDPOINT_URL_S3, // Optional if it's not standard AWS
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const bucketName = process.env.AWS_BUCKET_NAME || "synapse-platform-storage";
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const objecKey = `systemdocs/${uniqueFileName}`;

    const params = {
      Bucket: bucketName,
      Key: objecKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read", // Neon/S3 standard ACL if needed
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Depending on the endpoint, the URL will be formatted differently
    // For standard AWS S3: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
    // Since it's a custom endpoint (Neon), construct URL based on it:
    let fileUrl = "";
    if (process.env.AWS_ENDPOINT_URL_S3) {
      // Neon S3 URLs usually serve directly from the endpoint
      // Adjust if the bucket name is part of the path or domain
      fileUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${uniqueFileName}`;
    } else {
      fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    }

    res.status(200).json({
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file to S3" });
  }
};
