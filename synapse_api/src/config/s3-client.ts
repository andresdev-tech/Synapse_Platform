import "dotenv/config";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});

const bucket = "synapsestorage";

const fotos = [
    "andresgarcia.jpeg",
    "jhonlenis.jpeg",
];

for (const key of fotos) {
    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
        {
            expiresIn: 3600,
        }
    );

    console.log(`[view] ${key}: ${url}`);
}