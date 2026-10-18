import { Server } from "socket.io";
import { AUTH_COOKIE, env } from "../config/env.js";
import { verifyToken } from "../middleware/auth.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

let io = null;
// userId -> number of open sockets (a user can have several tabs open)
const onlineUsers = new Map();

const parseCookies = (header = "") =>
    Object.fromEntries(
        header
            .split(";")
            .map((part) => part.trim().split("="))
            .filter(([key]) => key)
            .map(([key, ...rest]) => [key, decodeURIComponent(rest.join("="))])
    );

const userRoom = (userId) => `user:${userId}`;

export const isOnline = (userId) => onlineUsers.has(String(userId));

export const getOnlineUserIds = () => [...onlineUsers.keys()];

export const emitToUser = (userId, event, payload) => {
    if (!io) return;
    io.to(userRoom(String(userId))).emit(event, payload);
};

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: env.isProduction ? undefined : { origin: env.clientUrl, credentials: true },
    });

    io.use((socket, next) => {
        try {
            const token = parseCookies(socket.handshake.headers.cookie)[AUTH_COOKIE];
            if (!token) return next(new Error("Unauthorized"));
            socket.userId = String(verifyToken(token).userId);
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const { userId } = socket;
        socket.join(userRoom(userId));

        const count = onlineUsers.get(userId) || 0;
        onlineUsers.set(userId, count + 1);
        if (count === 0) io.emit("presence:update", { userId, online: true });
        socket.emit("presence:list", getOnlineUserIds());

        socket.on("typing", async ({ conversationId, isTyping } = {}) => {
            if (!conversationId) return;
            const conversation = await Conversation.findOne({ _id: conversationId, participants: userId })
                .select("participants")
                .lean()
                .catch(() => null);
            if (!conversation) return;
            conversation.participants
                .filter((id) => String(id) !== userId)
                .forEach((id) => emitToUser(id, "typing", { conversationId, userId, isTyping: Boolean(isTyping) }));
        });

        socket.on("disconnect", async () => {
            const remaining = (onlineUsers.get(userId) || 1) - 1;
            if (remaining > 0) {
                onlineUsers.set(userId, remaining);
                return;
            }
            onlineUsers.delete(userId);
            const lastSeen = new Date();
            io.emit("presence:update", { userId, online: false, lastSeen });
            await User.updateOne({ _id: userId }, { lastSeen }).catch(() => {});
        });
    });

    return io;
};
