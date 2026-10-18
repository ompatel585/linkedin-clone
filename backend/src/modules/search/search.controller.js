import Job from "../../models/job.model.js";
import Post from "../../models/post.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { escapeRegex, parseLimit } from "../../utils/query.js";
import { POST_POPULATE } from "../posts/post.controller.js";

const TYPES = ["people", "posts", "jobs", "hashtags"];

const searchPeople = (regex, limit) =>
    User.find({ $or: [{ name: regex }, { username: regex }, { headline: regex }, { skills: regex }] })
        .select(`${USER_PREVIEW} location`)
        .limit(limit);

const searchPosts = (regex, limit) =>
    Post.find({ $or: [{ content: regex }, { hashtags: regex }] })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate(POST_POPULATE);

const searchJobs = (regex, limit) =>
    Job.find({ isOpen: true, $or: [{ title: regex }, { company: regex }, { skills: regex }, { location: regex }] })
        .select("-applications")
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("postedBy", USER_PREVIEW);

const searchHashtags = (regex, limit) =>
    Post.aggregate([
        { $unwind: "$hashtags" },
        { $match: { hashtags: regex } },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);

export const search = async (req, res) => {
    const raw = String(req.query.q || "").trim();
    const type = TYPES.includes(req.query.type) ? req.query.type : "all";
    const empty = { people: [], posts: [], jobs: [], hashtags: [] };

    if (!raw) return res.json(empty);

    const term = raw.startsWith("#") ? raw.slice(1) : raw;
    const regex = new RegExp(escapeRegex(term), "i");
    const limit = parseLimit(req.query.limit, type === "all" ? 5 : 20, 50);

    const run = (name, fn) => (type === "all" || type === name ? fn(regex, limit) : []);

    const [people, posts, jobs, hashtags] = await Promise.all([
        run("people", searchPeople),
        run("posts", searchPosts),
        run("jobs", searchJobs),
        run("hashtags", searchHashtags),
    ]);

    res.json({ ...empty, people, posts, jobs, hashtags });
};
