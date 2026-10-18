import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

export const NOTIFICATION_TYPES = [
    "like", // legacy
    "reaction",
    "comment",
    "repost",
    "connectionRequest",
    "connectionAccepted",
    "follow",
    "jobApplication",
    "applicationUpdate",
];

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: ObjectId, ref: "User", required: true },
        type: { type: String, required: true, enum: NOTIFICATION_TYPES },
        relatedUser: { type: ObjectId, ref: "User" },
        relatedPost: { type: ObjectId, ref: "Post" },
        relatedJob: { type: ObjectId, ref: "Job" },
        meta: { type: String, default: "" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
