import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const DATA_URL_PATTERN = /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i;

// Accepts a base64 data URL from the client. Uploads to Cloudinary when configured;
// otherwise (local development) the data URL itself is stored so images still work.
export const uploadImage = async (dataUrl, folder = "unlinked") => {
    if (!dataUrl) return undefined;
    if (/^https?:\/\//.test(dataUrl)) return dataUrl;
    if (!DATA_URL_PATTERN.test(dataUrl)) {
        const error = new Error("Unsupported image format");
        error.statusCode = 400;
        throw error;
    }
    if (!isCloudinaryConfigured) return dataUrl;

    const result = await cloudinary.uploader.upload(dataUrl, { folder });
    return result.secure_url;
};

export const deleteImage = async (url) => {
    if (!url || !isCloudinaryConfigured || !url.includes("res.cloudinary.com")) return;
    // public id = everything after /upload/v123/ without the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    if (!match) return;
    try {
        await cloudinary.uploader.destroy(match[1]);
    } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error.message);
    }
};
