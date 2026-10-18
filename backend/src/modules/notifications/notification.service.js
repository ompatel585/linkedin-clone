import Notification from "../../models/notification.model.js";
import { emitToUser } from "../../sockets/index.js";
import { idEquals } from "../../utils/query.js";

const POPULATE = [
    { path: "relatedUser", select: "name username profilePicture headline" },
    { path: "relatedPost", select: "content image" },
    { path: "relatedJob", select: "title company" },
];

// Creates a notification and pushes it to the recipient in real time.
// Never notifies a user about their own action.
export const notify = async ({ recipient, type, relatedUser, relatedPost, relatedJob, meta }) => {
    if (relatedUser && idEquals(recipient, relatedUser)) return null;

    const notification = await Notification.create({ recipient, type, relatedUser, relatedPost, relatedJob, meta });
    await notification.populate(POPULATE);
    emitToUser(recipient, "notification:new", notification);
    return notification;
};

// Removes a notification that no longer applies (e.g. a reaction was undone).
export const retractNotification = async (filter) => {
    await Notification.deleteMany(filter);
};

export const NOTIFICATION_POPULATE = POPULATE;
