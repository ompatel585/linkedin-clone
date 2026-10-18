import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { clearDatabase, createUser, startDatabase, stopDatabase } from "./setup.js";

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(clearDatabase);

const connect = async (a, b) => {
    await a.agent.post(`/api/v1/connections/request/${b.user._id}`).expect(201);
    const requests = await b.agent.get("/api/v1/connections/requests");
    await b.agent.put(`/api/v1/connections/accept/${requests.body[0]._id}`).expect(200);
};

describe("posts", () => {
    it("creates posts, extracts hashtags and paginates the feed", async () => {
        const alice = await createUser();
        for (let i = 0; i < 5; i += 1) {
            await alice.agent.post("/api/v1/posts").send({ content: `Post ${i} #Testing` }).expect(201);
        }

        const first = await alice.agent.get("/api/v1/posts?limit=3");
        expect(first.body.items).toHaveLength(3);
        expect(first.body.items[0].hashtags).toEqual(["testing"]);
        expect(first.body.nextCursor).toBeTruthy();

        const second = await alice.agent.get(`/api/v1/posts?limit=3&cursor=${encodeURIComponent(first.body.nextCursor)}`);
        expect(second.body.items).toHaveLength(2);
        expect(second.body.nextCursor).toBeNull();
    });

    it("rejects empty posts", async () => {
        const alice = await createUser();
        const res = await alice.agent.post("/api/v1/posts").send({ content: "   " });
        expect(res.status).toBe(400);
    });

    it("shows posts from connections and followed users in the feed", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const carol = await createUser();
        await bob.agent.post("/api/v1/posts").send({ content: "Bob here" });
        await carol.agent.post("/api/v1/posts").send({ content: "Carol here" });

        expect((await alice.agent.get("/api/v1/posts")).body.items).toHaveLength(0);
        expect((await alice.agent.get("/api/v1/posts?scope=all")).body.items).toHaveLength(2);

        await connect(alice, bob);
        await alice.agent.post(`/api/v1/users/${carol.user._id}/follow`).expect(200);

        const feed = await alice.agent.get("/api/v1/posts");
        expect(feed.body.items.map((p) => p.content).sort()).toEqual(["Bob here", "Carol here"]);
    });

    it("toggles and switches reactions and notifies the author", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const post = (await alice.agent.post("/api/v1/posts").send({ content: "Hello" })).body;

        let res = await bob.agent.post(`/api/v1/posts/${post._id}/react`).send({ type: "celebrate" });
        expect(res.body.reactions).toEqual([{ user: bob.user._id, type: "celebrate" }]);

        res = await bob.agent.post(`/api/v1/posts/${post._id}/react`).send({ type: "love" });
        expect(res.body.reactions).toEqual([{ user: bob.user._id, type: "love" }]);

        const notifications = await alice.agent.get("/api/v1/notifications");
        expect(notifications.body.items).toHaveLength(1);
        expect(notifications.body.items[0].type).toBe("reaction");

        res = await bob.agent.post(`/api/v1/posts/${post._id}/react`).send({ type: "love" });
        expect(res.body.reactions).toEqual([]);
        expect((await alice.agent.get("/api/v1/notifications/unread-count")).body.count).toBe(0);
    });

    it("lets only the author edit or delete a post", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const post = (await alice.agent.post("/api/v1/posts").send({ content: "Original" })).body;

        await bob.agent.patch(`/api/v1/posts/${post._id}`).send({ content: "Hacked" }).expect(403);
        const edited = await alice.agent.patch(`/api/v1/posts/${post._id}`).send({ content: "Edited #new" });
        expect(edited.body.content).toBe("Edited #new");
        expect(edited.body.hashtags).toEqual(["new"]);
        expect(edited.body.editedAt).toBeTruthy();

        await bob.agent.delete(`/api/v1/posts/${post._id}`).expect(403);
        await alice.agent.delete(`/api/v1/posts/${post._id}`).expect(200);
        await alice.agent.get(`/api/v1/posts/${post._id}`).expect(404);
    });

    it("adds and deletes comments with permission checks", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const carol = await createUser();
        const post = (await alice.agent.post("/api/v1/posts").send({ content: "Discuss" })).body;

        const commented = await bob.agent.post(`/api/v1/posts/${post._id}/comments`).send({ content: "Nice" });
        expect(commented.status).toBe(201);
        const commentId = commented.body.comments[0]._id;
        expect(commented.body.comments[0].user.username).toBe(bob.data.username);

        await carol.agent.delete(`/api/v1/posts/${post._id}/comments/${commentId}`).expect(403);
        const afterDelete = await alice.agent.delete(`/api/v1/posts/${post._id}/comments/${commentId}`);
        expect(afterDelete.body.comments).toHaveLength(0);
    });

    it("reposts the original post and counts reposts", async () => {
        const alice = await createUser();
        const bob = await createUser();
        const carol = await createUser();
        const original = (await alice.agent.post("/api/v1/posts").send({ content: "Share me" })).body;

        const repost = (await bob.agent.post(`/api/v1/posts/${original._id}/repost`).send({ content: "Worth reading" })).body;
        expect(repost.repostOf._id).toBe(original._id);

        // Reposting a repost points at the original
        const second = (await carol.agent.post(`/api/v1/posts/${repost._id}/repost`).send({})).body;
        expect(second.repostOf._id).toBe(original._id);

        const refreshed = await alice.agent.get(`/api/v1/posts/${original._id}`);
        expect(refreshed.body.repostCount).toBe(2);
    });

    it("saves posts and lists trending hashtags", async () => {
        const alice = await createUser();
        const post = (await alice.agent.post("/api/v1/posts").send({ content: "#react #node" })).body;
        await alice.agent.post("/api/v1/posts").send({ content: "#react again" });

        expect((await alice.agent.post(`/api/v1/posts/${post._id}/save`)).body.saved).toBe(true);
        expect((await alice.agent.get("/api/v1/posts/saved")).body).toHaveLength(1);

        const trending = await alice.agent.get("/api/v1/posts/trending-hashtags");
        expect(trending.body[0]).toEqual({ tag: "react", count: 2 });

        const tagged = await alice.agent.get("/api/v1/posts/hashtag/node");
        expect(tagged.body.items).toHaveLength(1);
    });
});
