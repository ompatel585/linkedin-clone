import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AUTH_COOKIE, env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const signToken = (userId) => jwt.sign({ userId }, env.jwtSecret, { expiresIn: TOKEN_TTL_SECONDS });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const setAuthCookie = (res, userId) => {
    res.cookie(AUTH_COOKIE, signToken(userId), {
        httpOnly: true,
        maxAge: TOKEN_TTL_SECONDS * 1000,
        sameSite: "strict",
        secure: env.isProduction,
    });
};

export const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE, { httpOnly: true, sameSite: "strict", secure: env.isProduction });
};

export const protectRoute = async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) throw ApiError.unauthorized("Unauthorized - No token provided");

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch {
        throw ApiError.unauthorized("Unauthorized - Invalid token");
    }

    const user = await User.findById(decoded.userId);
    if (!user) throw ApiError.unauthorized("User not found");

    req.user = user;
    next();
};
