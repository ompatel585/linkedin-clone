import { z } from "zod";
import { REACTION_TYPES } from "../../models/post.model.js";

export const createPostSchema = z
    .object({
        content: z.string().trim().max(3000).optional().default(""),
        image: z.string().optional().default(""),
    })
    .refine((data) => data.content || data.image, { message: "A post needs text or an image" });

export const updatePostSchema = z.object({
    content: z.string().trim().max(3000),
});

export const reactSchema = z.object({
    type: z.enum(REACTION_TYPES).default("like"),
});

export const commentSchema = z.object({
    content: z.string().trim().min(1, "Comment can't be empty").max(1500),
});

export const repostSchema = z.object({
    content: z.string().trim().max(3000).optional().default(""),
});
