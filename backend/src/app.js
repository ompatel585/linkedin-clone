import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import connectionRoutes from "./modules/connections/connection.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import jobRoutes from "./modules/jobs/job.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";

export const createApp = () => {
    const app = express();

    app.set("trust proxy", 1);
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    "img-src": ["'self'", "data:", "blob:", "https:"],
                    "connect-src": ["'self'", "ws:", "wss:"],
                },
            },
            crossOriginEmbedderPolicy: false,
        })
    );
    if (!env.isProduction) {
        app.use(cors({ origin: env.clientUrl, credentials: true }));
    }
    if (!env.isTest) app.use(morgan(env.isProduction ? "combined" : "dev"));

    // Images are sent as base64 data URLs, so allow reasonably large bodies
    app.use(express.json({ limit: "10mb" }));
    app.use(cookieParser());

    app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/users", userRoutes);
    app.use("/api/v1/posts", postRoutes);
    app.use("/api/v1/connections", connectionRoutes);
    app.use("/api/v1/notifications", notificationRoutes);
    app.use("/api/v1/search", searchRoutes);
    app.use("/api/v1/jobs", jobRoutes);
    app.use("/api/v1/messages", messageRoutes);
    app.use("/api", notFound);

    if (env.isProduction) {
        const distDir = path.resolve("frontend", "dist");
        app.use(express.static(distDir));
        app.get("/{*splat}", (req, res) => res.sendFile(path.join(distDir, "index.html")));
    }

    app.use(errorHandler);
    return app;
};
