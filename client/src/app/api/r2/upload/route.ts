import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import type {NextRequest} from "next/server";

export async function POST(request: NextRequest) {
  const CLOUDFARE_ACCOUNT_ID = process.env.CLOUDFARE_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

  if (!CLOUDFARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 credentials are not set");
  }
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${CLOUDFARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    const contentType = formData.get("contentType") as string;
    const filename = formData.get("filename") as string;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putObjectCommand = new PutObjectCommand({
      Bucket: "vcp-photobooth",
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    const result = await r2.send(putObjectCommand);

    let publicUrl = "";
    if (process.env.NODE_ENV === "development") {
      publicUrl = process.env.R2_PUBLIC_BUCKET_DEVELOPMENT_URL + "/" + filename;
    } else {
      publicUrl = process.env.R2_PUBLIC_BUCKET_PRODUCTION_URL + "/" + filename;
    }

    return Response.json({
      success: true,
      response: result,
      size: buffer.length,
      filename,
      contentType,
      url: publicUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Upload error details:", error);
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
}
