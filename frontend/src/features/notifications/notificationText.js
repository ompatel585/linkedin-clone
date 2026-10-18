import { APPLICATION_STATUSES, REACTIONS } from "../../lib/constants";

// The action phrase that follows the actor's name, e.g. "Ava Chen" + "commented on your post".
export const notificationText = (notification) => {
    switch (notification.type) {
        case "like":
            return "liked your post";
        case "reaction":
            return `reacted ${REACTIONS[notification.meta]?.emoji ?? "👍"} to your post`;
        case "comment":
            return "commented on your post";
        case "repost":
            return "reposted your post";
        case "connectionRequest":
            return "sent you a connection request";
        case "connectionAccepted":
            return "accepted your connection request";
        case "follow":
            return "started following you";
        case "jobApplication":
            return `applied to ${notification.relatedJob?.title ?? "your job"}`;
        case "applicationUpdate":
            return `updated your application for ${notification.relatedJob?.title ?? "a job"}: ${
                APPLICATION_STATUSES[notification.meta]?.label ?? notification.meta
            }`;
        default:
            return "sent you an update";
    }
};

export const notificationLink = (notification) => {
    if (notification.relatedPost) return `/post/${notification.relatedPost._id}`;
    if (notification.type === "jobApplication" && notification.relatedJob) {
        return `/jobs/${notification.relatedJob._id}/applicants`;
    }
    if (notification.relatedJob) return `/jobs/${notification.relatedJob._id}`;
    if (notification.type === "connectionRequest") return "/network";
    if (notification.relatedUser) return `/profile/${notification.relatedUser.username}`;
    return "/notifications";
};
