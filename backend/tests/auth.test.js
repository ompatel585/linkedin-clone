import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app, clearDatabase, createUser, startDatabase, stopDatabase } from "./setup.js";

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(clearDatabase);

describe("auth", () => {
    it("signs up, returns the user without a password and sets a cookie", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ name: "Jane Doe", username: "Jane.Doe", email: "JANE@example.com", password: "secret123" });

        expect(res.status).toBe(201);
        expect(res.body.user.username).toBe("jane.doe");
        expect(res.body.user.email).toBe("jane@example.com");
        expect(res.body.user.password).toBeUndefined();
        expect(res.headers["set-cookie"][0]).toMatch(/jwt-linkedin=/);
    });

    it("allows two users with the same display name", async () => {
        await createUser({ name: "Alex Smith" });
        await expect(createUser({ name: "Alex Smith" })).resolves.toBeDefined();
    });

    it("rejects invalid signup data with a helpful message", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ name: "J", username: "jd", email: "not-an-email", password: "123" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBeTruthy();
        expect(res.body.details.length).toBeGreaterThan(1);
    });

    it("rejects duplicate emails", async () => {
        await createUser({ email: "dup@example.com" });
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ name: "Other", username: "other", email: "dup@example.com", password: "secret123" });
        expect(res.status).toBe(409);
    });

    it("logs in with username or email and rejects wrong passwords", async () => {
        const { data } = await createUser();

        const byUsername = await request(app).post("/api/v1/auth/login").send({ username: data.username, password: data.password });
        expect(byUsername.status).toBe(200);

        const byEmail = await request(app).post("/api/v1/auth/login").send({ username: data.email, password: data.password });
        expect(byEmail.status).toBe(200);

        const wrong = await request(app).post("/api/v1/auth/login").send({ username: data.username, password: "nope" });
        expect(wrong.status).toBe(400);
    });

    it("protects /me and supports changing the password", async () => {
        expect((await request(app).get("/api/v1/auth/me")).status).toBe(401);

        const { agent, data } = await createUser();
        const me = await agent.get("/api/v1/auth/me");
        expect(me.status).toBe(200);
        expect(me.body.username).toBe(data.username);

        const bad = await agent.put("/api/v1/auth/password").send({ currentPassword: "wrong", newPassword: "newsecret" });
        expect(bad.status).toBe(400);

        const ok = await agent.put("/api/v1/auth/password").send({ currentPassword: data.password, newPassword: "newsecret" });
        expect(ok.status).toBe(200);

        const login = await request(app).post("/api/v1/auth/login").send({ username: data.username, password: "newsecret" });
        expect(login.status).toBe(200);
    });
});
