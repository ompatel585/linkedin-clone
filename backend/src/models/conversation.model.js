import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: ObjectId, ref: "User", required: true }],
        lastMessage: { type: ObjectId, ref: "Message" },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
