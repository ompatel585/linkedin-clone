import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

export const REACTION_TYPES = ["like", "celebrate", "love", "insightful", "funny"];

const commentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true, trim: true, maxlength: 1500 },
        user: { type: ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const reactionSchema = new mongoose.Schema(
    {
        user: { type: ObjectId, ref: "User", required: true },
        type: { type: String, enum: REACTION_TYPES, default: "like" },
    },
    { _id: false }
);

const postSchema = new mongoose.Schema(
    {
        author: { type: ObjectId, ref: "User", required: true, index: true },
        content: { type: String, default: "", trim: true, maxlength: 3000 },
        image: { type: String, default: "" },
        reactions: [reactionSchema],
        comments: [commentSchema],
        hashtags: [{ type: String, lowercase: true, index: true }],
        repostOf: { type: ObjectId, ref: "Post" },
        repostCount: { type: Number, default: 0 },
        editedAt: Date,
    },
    { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export const extractHashtags = (text = "") => {
    const tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    return [...new Set(tags.map((tag) => tag.slice(1).toLowerCase()))].slice(0, 20);
};

const Post = mongoose.model("Post", postSchema);

// Older posts stored a flat `likes` array. Convert them to reactions once.
export const migrateLegacyLikes = async () => {
    const result = await Post.collection.updateMany({ likes: { $exists: true } }, [
        {
            $set: {
                reactions: {
                    $concatArrays: [
                        { $ifNull: ["$reactions", []] },
                        { $map: { input: { $ifNull: ["$likes", []] }, as: "u", in: { user: "$$u", type: "like" } } },
                    ],
                },
            },
        },
        { $unset: "likes" },
    ]);
    if (result.modifiedCount) console.log(`Migrated likes to reactions on ${result.modifiedCount} posts`);
};

export default Post;
