export const uploadImageToR2 = async (image: string) => {
  try {
    if (!image || !image.includes("data:")) {
      console.error("Invalid image data provided");
      throw new Error("Invalid image data");
    }

    const imageData = image;

    const contentType = imageData.split(";")[0].split(":")[1];
    if (!contentType) {
      console.error("Could not determine content type from image data");
      throw new Error("Invalid image format");
    }

    const fileName = `${crypto.randomUUID()}.${contentType.split("/")[1]}`;

    const base64Data = imageData.split(",")[1];
    if (!base64Data) {
      console.error("Could not extract base64 data from image");
      throw new Error("Invalid image data format");
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
      console.error("R2 upload failed:", response.statusText || "Unknown error");
      throw new Error(response.statusText || "Unknown error");
    }
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Unknown error");
  }
};
