import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { clearDatabase, createUser, startDatabase, stopDatabase } from "./setup.js";

beforeAll(startDatabase);
afterAll(stopDatabase);
beforeEach(clearDatabase);

const JOB = {
    title: "Backend Engineer",
    company: "Acme",
    location: "Remote",
    workplaceType: "remote",
    employmentType: "full-time",
    experienceLevel: "mid",
    description: "Build and scale APIs for millions of users.",
    skills: ["Node.js"],
    salaryMin: 100000,
    salaryMax: 150000,
};

describe("jobs", () => {
    it("creates, filters, applies and manages applicants", async () => {
        const recruiter = await createUser();
        const seeker = await createUser();

        const job = (await recruiter.agent.post("/api/v1/jobs").send(JOB)).body;
        expect(job.isOwner).toBe(true);
        expect(job.applications).toBeUndefined();

        const list = (await seeker.agent.get("/api/v1/jobs?q=backend&workplaceType=remote")).body;
        expect(list.total).toBe(1);
        expect((await seeker.agent.get("/api/v1/jobs?workplaceType=onsite")).body.total).toBe(0);

        await recruiter.agent.post(`/api/v1/jobs/${job._id}/apply`).send({}).expect(400);
        const applied = await seeker.agent.post(`/api/v1/jobs/${job._id}/apply`).send({ coverLetter: "Hire me" });
        expect(applied.status).toBe(201);
        expect(applied.body.myApplication.status).toBe("submitted");
        await seeker.agent.post(`/api/v1/jobs/${job._id}/apply`).send({}).expect(409);

        await seeker.agent.get(`/api/v1/jobs/${job._id}/applicants`).expect(403);
        const applicants = (await recruiter.agent.get(`/api/v1/jobs/${job._id}/applicants`)).body;
        expect(applicants).toHaveLength(1);
        expect(applicants[0].coverLetter).toBe("Hire me");

        await recruiter.agent
            .patch(`/api/v1/jobs/${job._id}/applicants/${applicants[0]._id}`)
            .send({ status: "interview" })
            .expect(200);
        const appliedJobs = (await seeker.agent.get("/api/v1/jobs/applied")).body;
        expect(appliedJobs[0].myApplication.status).toBe("interview");

        const seekerNotifications = (await seeker.agent.get("/api/v1/notifications")).body.items;
        expect(seekerNotifications[0]).toMatchObject({ type: "applicationUpdate", meta: "interview" });
    });

    it("validates salary ranges and supports partial updates and saving", async () => {
        const recruiter = await createUser();
        await recruiter.agent.post("/api/v1/jobs").send({ ...JOB, salaryMin: 200, salaryMax: 100 }).expect(400);

        const job = (await recruiter.agent.post("/api/v1/jobs").send(JOB)).body;
        const updated = (await recruiter.agent.patch(`/api/v1/jobs/${job._id}`).send({ isOpen: false })).body;
        expect(updated.isOpen).toBe(false);
        expect(updated.title).toBe(JOB.title);

        const seeker = await createUser();
        expect((await seeker.agent.post(`/api/v1/jobs/${job._id}/save`)).body.saved).toBe(true);
        expect((await seeker.agent.get("/api/v1/jobs/saved")).body[0].isSaved).toBe(true);
        await seeker.agent.post(`/api/v1/jobs/${job._id}/apply`).send({}).expect(400);
    });
});

describe("messages", () => {
    it("starts one conversation per pair, sends messages and tracks unread", async () => {
        const alice = await createUser();
        const bob = await createUser();

        const convo = (await alice.agent.post("/api/v1/messages/conversations").send({ userId: bob.user._id })).body;
        expect(convo.participant._id).toBe(bob.user._id);
        const again = (await bob.agent.post("/api/v1/messages/conversations").send({ userId: alice.user._id })).body;
        expect(again._id).toBe(convo._id);

        // Empty conversations are hidden from the list
        expect((await alice.agent.get("/api/v1/messages/conversations")).body).toHaveLength(0);

        await alice.agent.post(`/api/v1/messages/conversations/${convo._id}/messages`).send({ text: "Hi Bob" }).expect(201);
        await alice.agent.post(`/api/v1/messages/conversations/${convo._id}/messages`).send({ text: "  " }).expect(400);

        const bobList = (await bob.agent.get("/api/v1/messages/conversations")).body;
        expect(bobList[0].unreadCount).toBe(1);
        expect(bobList[0].lastMessage.text).toBe("Hi Bob");
        expect((await bob.agent.get("/api/v1/messages/unread-count")).body.count).toBe(1);
        expect((await alice.agent.get("/api/v1/messages/unread-count")).body.count).toBe(0);

        await bob.agent.put(`/api/v1/messages/conversations/${convo._id}/read`).expect(200);
        expect((await bob.agent.get("/api/v1/messages/unread-count")).body.count).toBe(0);

        const messages = (await bob.agent.get(`/api/v1/messages/conversations/${convo._id}/messages`)).body;
        expect(messages.items).toHaveLength(1);

        const outsider = await createUser();
        await outsider.agent.get(`/api/v1/messages/conversations/${convo._id}/messages`).expect(404);
    });
});
