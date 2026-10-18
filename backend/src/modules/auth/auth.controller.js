import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";
import { env } from "../../config/env.js";
import { clearAuthCookie, setAuthCookie } from "../../middleware/auth.js";
import { sendWelcomeEmail } from "../../emails/emailHandlers.js";
import { ApiError } from "../../utils/ApiError.js";

export const signup = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (await User.exists({ email })) throw ApiError.conflict("Email already exists");
    if (await User.exists({ username })) throw ApiError.conflict("Username already exists");

    const user = await User.create({
        name,
        username,
        email,
        password: await bcrypt.hash(password, 10),
    });

    setAuthCookie(res, user._id);
    res.status(201).json({ message: "Account created successfully", user });

    sendWelcomeEmail(user.email, user.name, `${env.clientUrl}/profile/${user.username}`);
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ $or: [{ username }, { email: username }] }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw ApiError.badRequest("Invalid credentials");
    }

    setAuthCookie(res, user._id);
    res.json({ message: "Logged in successfully", user });
};

export const logout = (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = (req, res) => {
    res.json(req.user);
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw ApiError.badRequest("Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
};
