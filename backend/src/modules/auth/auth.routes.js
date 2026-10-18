import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { protectRoute } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { changePassword, getCurrentUser, login, logout, signup } from "./auth.controller.js";
import { changePasswordSchema, loginSchema, signupSchema } from "./auth.validation.js";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { message: "Too many attempts, please try again later" },
});

router.post("/signup", authLimiter, validateBody(signupSchema), signup);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protectRoute, getCurrentUser);
router.put("/password", protectRoute, validateBody(changePasswordSchema), changePassword);

export default router;
