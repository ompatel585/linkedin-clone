import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

export const isCloudinaryConfigured = Boolean(
    env.cloudinary.name && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: env.cloudinary.name,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
    });
}

export default cloudinary;
