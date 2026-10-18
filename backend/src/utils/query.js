import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

export const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const parseLimit = (value, fallback = 10, max = 50) => {
    const limit = Number.parseInt(value, 10);
    if (Number.isNaN(limit) || limit < 1) return fallback;
    return Math.min(limit, max);
};

export const parsePage = (value) => {
    const page = Number.parseInt(value, 10);
    return Number.isNaN(page) || page < 1 ? 1 : page;
};

export const assertObjectId = (id, label = "id") => {
    if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest(`Invalid ${label}`);
};

// Cursor pagination on createdAt (descending). The cursor is the createdAt ISO string
// of the last item from the previous page.
export const cursorFilter = (cursor) => {
    if (!cursor) return {};
    const date = new Date(cursor);
    if (Number.isNaN(date.getTime())) throw ApiError.badRequest("Invalid cursor");
    return { createdAt: { $lt: date } };
};

export const buildCursorPage = (items, limit) => {
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1].createdAt.toISOString() : null;
    return { items: page, nextCursor };
};

export const idEquals = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);
