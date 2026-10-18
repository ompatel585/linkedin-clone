import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { clearDatabase, createUser, startDatabase, stopDatabase } from "./setup.js";

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(clearDatabase);

describe("connections", () => {
    it("runs the request -> accept flow with status checks and notifications", async () => {
        const alice = await createUser();
        const bob = await createUser();

        await alice.agent.post(`/api/v1/connections/request/${bob.user._id}`).expect(201);
        await alice.agent.post(`/api/v1/connections/request/${bob.user._id}`).expect(400);
        // Bob can't send a reverse request while one is pending
        await bob.agent.post(`/api/v1/connections/request/${alice.user._id}`).expect(400);

        expect((await alice.agent.get(`/api/v1/connections/status/${bob.user._id}`)).body.status).toBe("pending");
        const received = (await bob.agent.get(`/api/v1/connections/status/${alice.user._id}`)).body;
        expect(received.status).toBe("received");

        const bobNotifications = await bob.agent.get("/api/v1/notifications");
        expect(bobNotifications.body.items[0].type).toBe("connectionRequest");

        await alice.agent.put(`/api/v1/connections/accept/${received.requestId}`).expect(403);
        await bob.agent.put(`/api/v1/connections/accept/${received.requestId}`).expect(200);

        expect((await alice.agent.get(`/api/v1/connections/status/${bob.user._id}`)).body.status).toBe("connected");
        expect((await alice.agent.get("/api/v1/connections")).body).toHaveLength(1);
        // The request notification is replaced by the result
        expect((await bob.agent.get("/api/v1/notifications")).body.items).toHaveLength(0);
        expect((await alice.agent.get("/api/v1/notifications")).body.items[0].type).toBe("connectionAccepted");

        await alice.agent.delete(`/api/v1/connections/${bob.user._id}`).expect(200);
        expect((await bob.agent.get("/api/v1/connections")).body).toHaveLength(0);
    });

    it("withdraws a sent request", async () => {
        const alice = await createUser();
        const bob = await createUser();
        await alice.agent.post(`/api/v1/connections/request/${bob.user._id}`).expect(201);
        expect((await alice.agent.get("/api/v1/connections/requests/sent")).body).toHaveLength(1);

        await alice.agent.delete(`/api/v1/connections/request/${bob.user._id}`).expect(200);
        expect((await bob.agent.get("/api/v1/connections/requests")).body).toHaveLength(0);
    });
});

describe("profiles and follows", () => {
    it("returns a public profile with counts and tracks views", async () => {
        const alice = await createUser();
        const bob = await createUser();

        const profile = await bob.agent.get(`/api/v1/users/${alice.data.username}`);
        expect(profile.status).toBe(200);
        expect(profile.body.password).toBeUndefined();
        expect(profile.body.connectionCount).toBe(0);

        await alice.agent.get(`/api/v1/users/${alice.data.username}`); // own views don't count
        expect((await alice.agent.get("/api/v1/users/me/stats")).body.profileViews).toBe(1);

        await bob.agent.get("/api/v1/users/nobody").expect(404);
    });

    it("toggles follow", async () => {
        const alice = await createUser();
        const bob = await createUser();

        expect((await alice.agent.post(`/api/v1/users/${bob.user._id}/follow`)).body.following).toBe(true);
        expect((await alice.agent.get(`/api/v1/users/${bob.data.username}`)).body.isFollowing).toBe(true);
        expect((await alice.agent.post(`/api/v1/users/${bob.user._id}/follow`)).body.following).toBe(false);
        await alice.agent.post(`/api/v1/users/${alice.user._id}/follow`).expect(400);
    });

    it("validates and updates the profile", async () => {
        const alice = await createUser();
        const res = await alice.agent.put("/api/v1/users/profile").send({
            headline: "Engineer",
            openToWork: true,
            skills: ["React", "Node"],
            experience: [{ title: "Dev", company: "Acme", startDate: "2020-01-01", endDate: null }],
            education: [{ school: "MIT", startYear: "2014", endYear: "" }],
        });
        expect(res.status).toBe(200);
        expect(res.body.headline).toBe("Engineer");
        expect(res.body.openToWork).toBe(true);
        expect(res.body.experience[0].company).toBe("Acme");
        expect(res.body.education[0].startYear).toBe(2014);
        expect(res.body.education[0].endYear).toBeNull();

        await alice.agent.put("/api/v1/users/profile").send({ password: "hack" }).expect(400);
    });

    it("suggests people ranked by mutual connections", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const carol = await createUser();
        await createUser();

        await alice.agent.post(`/api/v1/connections/request/${bob.user._id}`);
        let req = (await bob.agent.get("/api/v1/connections/requests")).body[0];
        await bob.agent.put(`/api/v1/connections/accept/${req._id}`);
        await carol.agent.post(`/api/v1/connections/request/${bob.user._id}`);
        req = (await bob.agent.get("/api/v1/connections/requests")).body[0];
        await bob.agent.put(`/api/v1/connections/accept/${req._id}`);

        const suggestions = (await alice.agent.get("/api/v1/users/suggestions")).body;
        expect(suggestions.map((s) => s._id)).not.toContain(bob.user._id);
        expect(suggestions[0]._id).toBe(carol.user._id);
        expect(suggestions[0].mutualCount).toBe(1);
    });
});

describe("search", () => {
    it("finds people, posts and hashtags", async () => {
        const alice = await createUser({ name: "Searchable Person" });
        await alice.agent.post("/api/v1/posts").send({ content: "Learning #GraphQL today" });

        const all = (await alice.agent.get("/api/v1/search?q=graphql")).body;
        expect(all.posts).toHaveLength(1);
        expect(all.hashtags[0].tag).toBe("graphql");

        const people = (await alice.agent.get("/api/v1/search?q=searchable&type=people")).body;
        expect(people.people).toHaveLength(1);
        expect(people.posts).toHaveLength(0);

        // Regex characters are escaped
        await alice.agent.get("/api/v1/search?q=(*").expect(200);
    });
});
