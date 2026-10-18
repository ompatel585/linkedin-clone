import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const experienceSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    description: { type: String, trim: true },
});

const educationSchema = new mongoose.Schema({
    school: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: Number,
    endYear: Number,
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, trim: true, lowercase: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true, select: false },
        profilePicture: { type: String, default: "" },
        bannerImage: { type: String, default: "" },
        headline: { type: String, default: "UnLinked member", trim: true },
        location: { type: String, default: "", trim: true },
        about: { type: String, default: "" },
        website: { type: String, default: "", trim: true },
        openToWork: { type: Boolean, default: false },
        skills: [{ type: String, trim: true }],
        experience: [experienceSchema],
        education: [educationSchema],
        connections: [{ type: ObjectId, ref: "User" }],
        followers: [{ type: ObjectId, ref: "User" }],
        following: [{ type: ObjectId, ref: "User" }],
        savedPosts: [{ type: ObjectId, ref: "Post" }],
        savedJobs: [{ type: ObjectId, ref: "Job" }],
        profileViews: { type: Number, default: 0 },
        lastSeen: Date,
    },
    { timestamps: true }
);

userSchema.index({ name: 1 });

userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

// Minimal public projection used when populating authors, senders, etc.
export const USER_PREVIEW = "name username profilePicture headline openToWork";

const User = mongoose.model("User", userSchema);

export default User;
