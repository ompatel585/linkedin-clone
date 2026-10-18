import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: ObjectId, ref: "Conversation", required: true },
        sender: { type: ObjectId, ref: "User", required: true },
        text: { type: String, required: true, trim: true, maxlength: 4000 },
        readBy: [{ type: ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
