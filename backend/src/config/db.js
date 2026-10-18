import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

// Without MONGO_URI in development we spin up an in-memory MongoDB so the app
// runs out of the box. Data is lost when the server stops.
const resolveMongoUri = async () => {
    if (env.mongoUri) return { uri: env.mongoUri, inMemory: false };
    if (env.isProduction) throw new Error("MONGO_URI must be set in production");

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    return { uri: memoryServer.getUri(), inMemory: true };
};

export const connectDB = async () => {
    const { uri, inMemory } = await resolveMongoUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}${inMemory ? " (in-memory)" : ""}`);
    return { inMemory };
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
    if (memoryServer) await memoryServer.stop();
};
