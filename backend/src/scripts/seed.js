import { pathToFileURL } from "url";
import bcrypt from "bcryptjs";
import ConnectionRequest from "../models/connectionRequest.model.js";
import Conversation from "../models/conversation.model.js";
import Job from "../models/job.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import Post, { extractHashtags } from "../models/post.model.js";
import User from "../models/user.model.js";

export const DEMO_PASSWORD = "password123";

const USERS = [
    {
        name: "Ava Chen",
        username: "ava",
        headline: "Senior Frontend Engineer at Northwind · React & design systems",
        location: "San Francisco, CA",
        about: "I build accessible, fast interfaces and mentor junior engineers. Currently obsessed with design tokens.",
        skills: ["React", "TypeScript", "Accessibility", "Design Systems"],
        experience: [
            { title: "Senior Frontend Engineer", company: "Northwind", startDate: "2022-03-01", description: "Lead the design system team." },
            { title: "Frontend Engineer", company: "Pixelworks", startDate: "2019-06-01", endDate: "2022-02-01" },
        ],
        education: [{ school: "UC Berkeley", degree: "B.S.", fieldOfStudy: "Computer Science", startYear: 2015, endYear: 2019 }],
    },
    {
        name: "Marcus Johnson",
        username: "marcus",
        headline: "Engineering Manager · Hiring backend engineers",
        location: "Austin, TX",
        about: "Managing platform teams. Always happy to chat about distributed systems and careers.",
        skills: ["Leadership", "Node.js", "Go", "Kubernetes"],
        experience: [{ title: "Engineering Manager", company: "Cloudline", startDate: "2021-01-01" }],
    },
    {
        name: "Priya Sharma",
        username: "priya",
        headline: "Data Scientist · ML in production",
        location: "Bengaluru, India",
        skills: ["Python", "Machine Learning", "SQL", "PyTorch"],
        openToWork: true,
    },
    {
        name: "Diego Alvarez",
        username: "diego",
        headline: "Product Designer at Loop",
        location: "Mexico City",
        skills: ["Figma", "UX Research", "Prototyping"],
    },
    {
        name: "Sara Okafor",
        username: "sara",
        headline: "Technical Recruiter · Connecting great engineers with great teams",
        location: "London, UK",
        skills: ["Recruiting", "Sourcing", "Employer Branding"],
    },
    {
        name: "Liam Novak",
        username: "liam",
        headline: "Full-stack developer · MERN · Open source contributor",
        location: "Prague, Czechia",
        skills: ["MongoDB", "Express", "React", "Node.js"],
        openToWork: true,
    },
    {
        name: "Emma Wilson",
        username: "emma",
        headline: "DevRel at Stackbase",
        location: "Toronto, Canada",
        skills: ["Public Speaking", "Writing", "JavaScript"],
    },
    {
        name: "Noah Kim",
        username: "noah",
        headline: "Mobile Engineer · React Native & Swift",
        location: "Seoul, South Korea",
        skills: ["React Native", "Swift", "iOS"],
    },
    {
        name: "Zoe Martin",
        username: "zoe",
        headline: "Cloud Architect · AWS Certified",
        location: "Paris, France",
        skills: ["AWS", "Terraform", "Security"],
    },
];

const POSTS = [
    ["ava", "Just shipped dark mode for our entire design system 🌙 Tokens made this a two-week job instead of two months. #designsystems #frontend #react"],
    ["marcus", "We're hiring backend engineers who love reliability work. Remote-friendly, great team. Check the Jobs tab! #hiring #nodejs"],
    ["priya", "Hot take: most ML problems are data problems wearing a trench coat. Spend the time on your dataset. #machinelearning #datascience"],
    ["diego", "Ran 12 user interviews this week. The most useful question: \"What did you expect to happen?\" #ux #design"],
    ["liam", "My first PR to a major open source project got merged today 🎉 Small fix, big smile. #opensource #javascript"],
    ["emma", "Slides from my talk on building real-time apps with WebSockets are up. Thanks to everyone who came! #javascript #websockets"],
    ["sara", "Tip for job seekers: tailor the first three lines of your profile 'About' section. That's what recruiters see first. #careers #hiring"],
    ["ava", "Accessibility isn't a feature, it's a quality bar. Keyboard-test every component you ship. #a11y #frontend"],
];

const JOBS = [
    {
        poster: "marcus",
        title: "Senior Backend Engineer (Node.js)",
        company: "Cloudline",
        location: "Austin, TX",
        workplaceType: "remote",
        employmentType: "full-time",
        experienceLevel: "senior",
        salaryMin: 140000,
        salaryMax: 180000,
        skills: ["Node.js", "MongoDB", "Kubernetes"],
        description:
            "Join the platform team building the services that power Cloudline. You'll design APIs, improve reliability and mentor engineers.",
    },
    {
        poster: "sara",
        title: "Frontend Developer",
        company: "Brightpath",
        location: "London, UK",
        workplaceType: "hybrid",
        employmentType: "full-time",
        experienceLevel: "mid",
        salaryMin: 60000,
        salaryMax: 80000,
        skills: ["React", "CSS", "Testing"],
        description:
            "Brightpath is looking for a frontend developer to build delightful learning experiences used by thousands of students.",
    },
    {
        poster: "emma",
        title: "Developer Advocate Intern",
        company: "Stackbase",
        location: "Toronto, Canada",
        workplaceType: "onsite",
        employmentType: "internship",
        experienceLevel: "entry",
        skills: ["JavaScript", "Writing"],
        description:
            "Help developers succeed with Stackbase by writing tutorials, building sample apps and speaking at meetups.",
    },
];

const isEmpty = async () => (await User.estimatedDocumentCount()) === 0;

export const seedDatabase = async ({ onlyIfEmpty = false } = {}) => {
    if (onlyIfEmpty && !(await isEmpty())) return false;

    await Promise.all(
        [User, Post, Job, ConnectionRequest, Notification, Conversation, Message].map((model) => model.deleteMany({}))
    );

    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    const users = await User.insertMany(
        USERS.map((u) => ({ ...u, email: `${u.username}@example.com`, password, profileViews: 10 + u.name.length }))
    );
    const byName = Object.fromEntries(users.map((u) => [u.username, u]));

    // Connections (mutual) and follows
    const pairs = [
        ["ava", "marcus"], ["ava", "priya"], ["ava", "diego"], ["ava", "emma"],
        ["marcus", "sara"], ["marcus", "liam"], ["priya", "liam"], ["diego", "emma"],
        ["noah", "priya"], ["zoe", "marcus"], ["zoe", "diego"],
    ];
    for (const [a, b] of pairs) {
        byName[a].connections.push(byName[b]._id);
        byName[b].connections.push(byName[a]._id);
    }
    byName.liam.following.push(byName.ava._id);
    byName.ava.followers.push(byName.liam._id);
    await Promise.all(users.map((u) => u.save()));

    await ConnectionRequest.create([
        { sender: byName.sara._id, recipient: byName.ava._id },
        { sender: byName.liam._id, recipient: byName.ava._id },
    ]);

    const now = Date.now();
    const posts = await Post.insertMany(
        POSTS.map(([author, content], i) => ({
            author: byName[author]._id,
            content,
            hashtags: extractHashtags(content),
            createdAt: new Date(now - (i + 1) * 3 * 60 * 60 * 1000),
            reactions: users
                .filter((u) => u.username !== author)
                .slice(0, (i % 5) + 1)
                .map((u, j) => ({ user: u._id, type: ["like", "celebrate", "love", "insightful", "funny"][(i + j) % 5] })),
            comments:
                i % 2 === 0
                    ? [
                          { user: byName.emma._id, content: "Love this, thanks for sharing!" },
                          { user: byName.marcus._id, content: "Great point 👏" },
                      ]
                    : [],
        }))
    );

    await Job.insertMany(
        JOBS.map(({ poster, ...job }, i) => ({
            ...job,
            postedBy: byName[poster]._id,
            createdAt: new Date(now - i * 24 * 60 * 60 * 1000),
            applications: i === 0 ? [{ user: byName.liam._id, coverLetter: "I'd love to join the platform team." }] : [],
        }))
    );

    const conversation = await Conversation.create({ participants: [byName.ava._id, byName.marcus._id] });
    const messages = await Message.insertMany(
        [
            [byName.marcus, "Hey Ava! Loved your post about dark mode."],
            [byName.ava, "Thanks Marcus! It was a fun project."],
            [byName.marcus, "Would you be up for a talk at our engineering all-hands?"],
        ].map(([sender, text], i) => ({
            conversation: conversation._id,
            sender: sender._id,
            text,
            readBy: i < 2 ? [byName.ava._id, byName.marcus._id] : [byName.marcus._id],
            createdAt: new Date(now - (3 - i) * 10 * 60 * 1000),
        }))
    );
    conversation.lastMessage = messages.at(-1)._id;
    conversation.lastMessageAt = messages.at(-1).createdAt;
    await conversation.save();

    await Notification.insertMany([
        { recipient: byName.ava._id, type: "connectionRequest", relatedUser: byName.sara._id },
        { recipient: byName.ava._id, type: "connectionRequest", relatedUser: byName.liam._id },
        { recipient: byName.ava._id, type: "reaction", relatedUser: byName.marcus._id, relatedPost: posts[0]._id, meta: "celebrate" },
        { recipient: byName.ava._id, type: "comment", relatedUser: byName.emma._id, relatedPost: posts[0]._id },
        { recipient: byName.ava._id, type: "follow", relatedUser: byName.liam._id, read: true },
    ]);

    console.log(`Seeded demo data: ${users.length} users (password "${DEMO_PASSWORD}"), log in as "ava"`);
    return true;
};

// Allow running directly: `npm run seed`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { connectDB, disconnectDB } = await import("../config/db.js");
    await connectDB();
    await seedDatabase({ onlyIfEmpty: process.argv.includes("--if-empty") });
    await disconnectDB();
}
