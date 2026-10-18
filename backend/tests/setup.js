import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";

let mongo;

export const app = createApp();

export const startDatabase = async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
};

export const stopDatabase = async () => {
    await mongoose.disconnect();
    await mongo?.stop();
};

export const clearDatabase = async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

let counter = 0;

// Signs up a fresh user and returns a supertest agent that keeps the auth cookie.
export const createUser = async (overrides = {}) => {
    counter += 1;
    const data = {
        name: `Test User ${counter}`,
        username: `user${counter}`,
        email: `user${counter}@example.com`,
        password: "secret123",
        ...overrides,
    };
    const agent = request.agent(app);
    const res = await agent.post("/api/v1/auth/signup").send(data);
    if (res.status !== 201) throw new Error(`Signup failed: ${JSON.stringify(res.body)}`);
    return { agent, user: res.body.user, data };
};
