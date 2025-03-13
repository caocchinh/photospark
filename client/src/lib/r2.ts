import {S3Client} from "@aws-sdk/client-s3";

const CLOUDFARE_ACCOUNT_ID = process.env.CLOUDFARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!CLOUDFARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error("R2 credentials are not set");
}

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default R2;

export const uploadImageToR2 = async (image: string) => {
  try {
    if (!image || !image.includes("data:")) {
      console.error("Invalid image data provided");
      return Response.json({success: false, error: "Invalid image data"});
    }

    const imageData = image;

    const contentType = imageData.split(";")[0].split(":")[1];
    if (!contentType) {
      console.error("Could not determine content type from image data");
      return Response.json({success: false, error: "Invalid image format"});
    }

    const fileName = `${crypto.randomUUID()}.${contentType.split("/")[1]}`;

    const base64Data = imageData.split(",")[1];
    if (!base64Data) {
      console.error("Could not extract base64 data from image");
      return Response.json({success: false, error: "Invalid image data format"});
    }

    const blobData = new Blob([Buffer.from(base64Data, "base64")], {type: contentType});

    const formData = new FormData();
    formData.append("file", blobData, fileName);
    formData.append("contentType", contentType);
    formData.append("filename", fileName);

    const response = await fetch(`/api/r2/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("R2 upload failed:", errorData.error || "Unknown error");
      return Response.json({success: false, error: errorData.error || "Unknown error"});
    }
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({success: false, error: "Unknown error"});
  }
};
