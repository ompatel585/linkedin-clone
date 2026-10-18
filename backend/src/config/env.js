import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
    nodeEnv,
    isProduction: nodeEnv === "production",
    isTest: nodeEnv === "test",
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI || "",
    jwtSecret: process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "dev-only-insecure-secret"),
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    cloudinary: {
        name: process.env.CLOUDINARY_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
    mail: {
        token: process.env.MAILTRAP_TOKEN || "",
        from: process.env.EMAIL_FROM || "",
        fromName: process.env.EMAIL_FROM_NAME || "UnLinked",
    },
    seedOnStart: process.env.SEED_ON_START === "true",
};

if (env.isProduction && !env.jwtSecret) {
    throw new Error("JWT_SECRET must be set in production");
}

export const AUTH_COOKIE = "jwt-linkedin";
