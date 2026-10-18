import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";
    let details = err.details;

    if (err instanceof ZodError) {
        status = 400;
        details = err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
        message = details[0]?.message || "Validation failed";
    } else if (err instanceof mongoose.Error.CastError) {
        status = 400;
        message = `Invalid ${err.path}`;
    } else if (err instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = Object.values(err.errors)[0]?.message || "Validation failed";
    } else if (err?.code === 11000) {
        status = 409;
        const field = Object.keys(err.keyValue || {})[0] || "value";
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    } else if (err?.type === "entity.too.large") {
        status = 413;
        message = "Request is too large";
    }

    if (status >= 500) {
        console.error(err);
        if (env.isProduction) message = "Internal server error";
    }

    res.status(status).json({ message, ...(details ? { details } : {}) });
};
