import { Bell, BriefcaseBusiness, House, MessageSquareText, Users } from "lucide-react";
import { useUnreadNotificationCount } from "../../features/notifications/api";
import { useUnreadMessageCount } from "../../features/messaging/api";
import { useConnectionRequests } from "../../features/network/api";

export const NAV_ITEMS = [
    { to: "/", label: "Home", icon: House, end: true },
    { to: "/network", label: "My Network", icon: Users, count: "requests" },
    { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { to: "/messaging", label: "Messaging", icon: MessageSquareText, count: "messages" },
    { to: "/notifications", label: "Notifications", icon: Bell, count: "notifications" },
];

// Badge counts shown on the navigation icons
export const useNavCounts = () => {
    const { data: notifications = 0 } = useUnreadNotificationCount();
    const { data: messages = 0 } = useUnreadMessageCount();
    const { data: requests = [] } = useConnectionRequests();
    return { notifications, messages, requests: requests.length };
};
