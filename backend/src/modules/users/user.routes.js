import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import {
    getProfileStats,
    getPublicProfile,
    getSuggestedConnections,
    getUserFollowers,
    toggleFollow,
    updateProfile,
} from "./user.controller.js";
import { updateProfileSchema } from "./user.validation.js";

const router = Router();

router.use(protectRoute);

router.get("/suggestions", getSuggestedConnections);
router.get("/me/stats", getProfileStats);
router.put("/profile", validateBody(updateProfileSchema), updateProfile);
router.post("/:userId/follow", toggleFollow);
router.get("/:username/followers", getUserFollowers);
router.get("/:username", getPublicProfile);

export default router;
