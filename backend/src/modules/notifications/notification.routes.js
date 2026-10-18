import { Router } from "express";
import { protectRoute } from "../../middleware/auth.js";
import {
    deleteNotification,
    getUnreadCount,
    getUserNotifications,
    markAllAsRead,
    markNotificationAsRead,
} from "./notification.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);

export default router;
