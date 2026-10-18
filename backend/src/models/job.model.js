import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship", "temporary"];
export const WORKPLACE_TYPES = ["onsite", "remote", "hybrid"];
export const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead"];
export const APPLICATION_STATUSES = ["submitted", "reviewing", "interview", "rejected", "hired"];

const applicationSchema = new mongoose.Schema(
    {
        user: { type: ObjectId, ref: "User", required: true },
        coverLetter: { type: String, default: "", maxlength: 3000 },
        resumeUrl: { type: String, default: "" },
        status: { type: String, enum: APPLICATION_STATUSES, default: "submitted" },
    },
    { timestamps: true }
);

const jobSchema = new mongoose.Schema(
    {
        postedBy: { type: ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, default: "", trim: true },
        workplaceType: { type: String, enum: WORKPLACE_TYPES, default: "onsite" },
        employmentType: { type: String, enum: EMPLOYMENT_TYPES, default: "full-time" },
        experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, default: "mid" },
        description: { type: String, required: true },
        skills: [{ type: String, trim: true }],
        salaryMin: Number,
        salaryMax: Number,
        isOpen: { type: Boolean, default: true },
        applications: [applicationSchema],
    },
    { timestamps: true }
);

jobSchema.index({ createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
