import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
    createComment,
    createPost,
    deleteComment,
    deletePost,
    getFeedPosts,
    getHashtagPosts,
    getPostById,
    getSavedPosts,
    getTrendingHashtags,
    getUserPosts,
    reactToPost,
    repostPost,
    toggleSavePost,
    updatePost,
} from "./post.controller.js";
import { commentSchema, createPostSchema, reactSchema, repostSchema, updatePostSchema } from "./post.validation.js";

const router = Router();

router.use(protectRoute);

router.get("/", getFeedPosts);
router.post("/", validateBody(createPostSchema), createPost);
router.get("/saved", getSavedPosts);
router.get("/trending-hashtags", getTrendingHashtags);
router.get("/hashtag/:tag", getHashtagPosts);
router.get("/user/:username", getUserPosts);

router.get("/:id", getPostById);
router.patch("/:id", validateBody(updatePostSchema), updatePost);
router.delete("/:id", deletePost);
router.post("/:id/react", validateBody(reactSchema), reactToPost);
router.post("/:id/comments", validateBody(commentSchema), createComment);
router.delete("/:id/comments/:commentId", deleteComment);
router.post("/:id/repost", validateBody(repostSchema), repostPost);
router.post("/:id/save", toggleSavePost);

export default router;
