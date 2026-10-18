import Post, { extractHashtags } from "../../models/post.model.js";
import User, { USER_PREVIEW } from "../../models/user.model.js";
import { env } from "../../config/env.js";
import { sendCommentNotificationEmail } from "../../emails/emailHandlers.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, buildCursorPage, cursorFilter, idEquals, parseLimit } from "../../utils/query.js";
import { deleteImage, uploadImage } from "../../utils/upload.js";
import { notify, retractNotification } from "../notifications/notification.service.js";

export const POST_POPULATE = [
    { path: "author", select: USER_PREVIEW },
    { path: "comments.user", select: USER_PREVIEW },
    { path: "repostOf", populate: { path: "author", select: USER_PREVIEW } },
];

const findPostOrThrow = async (id) => {
    assertObjectId(id, "post id");
    const post = await Post.findById(id);
    if (!post) throw ApiError.notFound("Post not found");
    return post;
};

const paginatePosts = async (filter, query) => {
    const limit = parseLimit(query.limit, 10, 30);
    const posts = await Post.find({ ...filter, ...cursorFilter(query.cursor) })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate(POST_POPULATE);
    return buildCursorPage(posts, limit);
};

export const getFeedPosts = async (req, res) => {
    const me = req.user;
    const filter =
        req.query.scope === "all" ? {} : { author: { $in: [me._id, ...me.connections, ...me.following] } };
    res.json(await paginatePosts(filter, req.query));
};

export const getUserPosts = async (req, res) => {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select("_id");
    if (!user) throw ApiError.notFound("User not found");
    res.json(await paginatePosts({ author: user._id }, req.query));
};

export const getHashtagPosts = async (req, res) => {
    res.json(await paginatePosts({ hashtags: req.params.tag.toLowerCase() }, req.query));
};

export const getSavedPosts = async (req, res) => {
    const me = await User.findById(req.user._id).select("savedPosts");
    const posts = await Post.find({ _id: { $in: me.savedPosts } })
        .sort({ createdAt: -1 })
        .populate(POST_POPULATE);
    res.json(posts);
};

export const getTrendingHashtags = async (req, res) => {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const tags = await Post.aggregate([
        { $match: { createdAt: { $gte: since }, hashtags: { $exists: true, $ne: [] } } },
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: parseLimit(req.query.limit, 8, 20) },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
    res.json(tags);
};

export const createPost = async (req, res) => {
    const { content, image } = req.body;
    const post = await Post.create({
        author: req.user._id,
        content,
        image: image ? await uploadImage(image, "unlinked/posts") : "",
        hashtags: extractHashtags(content),
    });
    await post.populate(POST_POPULATE);
    res.status(201).json(post);
};

export const getPostById = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    await post.populate(POST_POPULATE);
    res.json(post);
};

export const updatePost = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    if (!idEquals(post.author, req.user._id)) throw ApiError.forbidden("You can only edit your own posts");
    if (!req.body.content && !post.image && !post.repostOf) throw ApiError.badRequest("A post needs text or an image");

    post.content = req.body.content;
    post.hashtags = extractHashtags(req.body.content);
    post.editedAt = new Date();
    await post.save();
    await post.populate(POST_POPULATE);
    res.json(post);
};

export const deletePost = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    if (!idEquals(post.author, req.user._id)) throw ApiError.forbidden("You can only delete your own posts");

    await deleteImage(post.image);
    await post.deleteOne();
    if (post.repostOf) await Post.updateOne({ _id: post.repostOf }, { $inc: { repostCount: -1 } });
    await User.updateMany({ savedPosts: post._id }, { $pull: { savedPosts: post._id } });
    await retractNotification({ relatedPost: post._id });

    res.json({ message: "Post deleted successfully" });
};

export const reactToPost = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    const userId = req.user._id;
    const { type } = req.body;

    const existing = post.reactions.find((r) => idEquals(r.user, userId));
    if (existing && existing.type === type) {
        post.reactions = post.reactions.filter((r) => !idEquals(r.user, userId));
        await retractNotification({ recipient: post.author, relatedUser: userId, relatedPost: post._id, type: "reaction" });
    } else if (existing) {
        existing.type = type;
    } else {
        post.reactions.push({ user: userId, type });
        await notify({ recipient: post.author, type: "reaction", relatedUser: userId, relatedPost: post._id, meta: type });
    }

    await post.save();
    res.json({ _id: post._id, reactions: post.reactions });
};

export const createComment = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    const { content } = req.body;

    post.comments.push({ user: req.user._id, content });
    await post.save();

    if (!idEquals(post.author, req.user._id)) {
        await notify({ recipient: post.author, type: "comment", relatedUser: req.user._id, relatedPost: post._id });
        const author = await User.findById(post.author).select("name email");
        if (author) {
            sendCommentNotificationEmail(
                author.email,
                author.name,
                req.user.name,
                `${env.clientUrl}/post/${post._id}`,
                content
            );
        }
    }

    await post.populate(POST_POPULATE);
    res.status(201).json(post);
};

export const deleteComment = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) throw ApiError.notFound("Comment not found");

    const canDelete = idEquals(comment.user, req.user._id) || idEquals(post.author, req.user._id);
    if (!canDelete) throw ApiError.forbidden("You can't delete this comment");

    comment.deleteOne();
    await post.save();
    await post.populate(POST_POPULATE);
    res.json(post);
};

export const repostPost = async (req, res) => {
    const target = await findPostOrThrow(req.params.id);
    // Reposting a repost shares the original
    const original = target.repostOf ? await findPostOrThrow(target.repostOf) : target;

    const repost = await Post.create({
        author: req.user._id,
        content: req.body.content,
        repostOf: original._id,
        hashtags: extractHashtags(req.body.content),
    });
    await Post.updateOne({ _id: original._id }, { $inc: { repostCount: 1 } });
    await notify({ recipient: original.author, type: "repost", relatedUser: req.user._id, relatedPost: original._id });

    await repost.populate(POST_POPULATE);
    res.status(201).json(repost);
};

export const toggleSavePost = async (req, res) => {
    const post = await findPostOrThrow(req.params.id);
    const isSaved = req.user.savedPosts.some((id) => idEquals(id, post._id));

    await User.updateOne(
        { _id: req.user._id },
        isSaved ? { $pull: { savedPosts: post._id } } : { $addToSet: { savedPosts: post._id } }
    );
    res.json({ saved: !isSaved });
};
