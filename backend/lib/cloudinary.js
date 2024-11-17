import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, // Ensure this is set
    api_key: process.env.CLOUDINARY_API_KEY,      // Ensure this is set
    api_secret: process.env.CLOUDINARY_API_SECRET // Ensure this is set
});

export default cloudinary;