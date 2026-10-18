import Notification from "../../models/notification.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertObjectId, buildCursorPage, cursorFilter, parseLimit } from "../../utils/query.js";
import { NOTIFICATION_POPULATE } from "./notification.service.js";

export const getUserNotifications = async (req, res) => {
    const limit = parseLimit(req.query.limit, 20, 50);
    const filter = { recipient: req.user._id, ...cursorFilter(req.query.cursor) };
    if (req.query.unread === "true") filter.read = false;

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate(NOTIFICATION_POPULATE);

    res.json(buildCursorPage(notifications, limit));
};

export const getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
};

export const markNotificationAsRead = async (req, res) => {
    assertObjectId(req.params.id, "notification id");
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { read: true },
        { new: true }
    ).populate(NOTIFICATION_POPULATE);
    if (!notification) throw ApiError.notFound("Notification not found");
    res.json(notification);
};

export const markAllAsRead = async (req, res) => {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
};

export const deleteNotification = async (req, res) => {
    assertObjectId(req.params.id, "notification id");
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    if (!deleted) throw ApiError.notFound("Notification not found");
    res.json({ message: "Notification deleted" });
};
