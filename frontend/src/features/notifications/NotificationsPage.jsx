import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCheck, Ellipsis, MailOpen, Trash2 } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Menu from "../../components/ui/Menu";
import { Card, EmptyState, ErrorState, ListSkeleton, Spinner } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useInView } from "../../hooks/useInView";
import { cn, timeAgo } from "../../lib/utils";
import { ProfileSummaryCard } from "../feed/components/Sidebars";
import { useDeleteNotification, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadNotificationCount } from "./api";
import { notificationLink, notificationText } from "./notificationText";

const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { mutate: markRead } = useMarkNotificationRead();
    const { mutate: remove } = useDeleteNotification();
    const actor = notification.relatedUser;

    const open = () => {
        if (!notification.read) markRead(notification._id);
        navigate(notificationLink(notification));
    };

    return (
        <li className={cn("flex gap-3 px-4 py-3 items-start transition-colors hover:bg-base-200", !notification.read && "bg-secondary/40")}>
            <span className={cn("mt-5 size-2 rounded-full shrink-0", notification.read ? "bg-transparent" : "bg-primary")} />
            <Avatar user={actor} size="md" />
            <button className="flex-1 min-w-0 text-left" onClick={open}>
                <p className="text-sm">
                    <span className="font-semibold">{actor?.name ?? "Someone"}</span> {notificationText(notification)}
                </p>
                {notification.relatedPost?.content && (
                    <p className="text-sm text-muted line-clamp-2 mt-0.5">“{notification.relatedPost.content}”</p>
                )}
                <p className="text-xs text-muted mt-1">{timeAgo(notification.createdAt)}</p>
            </button>
            <Menu
                trigger={({ toggle }) => (
                    <button className="btn btn-ghost btn-sm btn-circle" onClick={toggle} aria-label="Notification options">
                        <Ellipsis className="size-5" />
                    </button>
                )}
                items={[
                    !notification.read && { label: "Mark as read", icon: MailOpen, onClick: () => markRead(notification._id) },
                    { label: "Delete notification", icon: Trash2, onClick: () => remove(notification._id), danger: true },
                ]}
            />
        </li>
    );
};

const NotificationsPage = () => {
    useDocumentTitle("Notifications");
    const [filter, setFilter] = useState("all");
    const query = useNotifications(filter);
    const { data: unread = 0 } = useUnreadNotificationCount();
    const { mutate: markAll, isPending: markingAll } = useMarkAllNotificationsRead();
    const sentinel = useInView(() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage(), {
        enabled: Boolean(query.hasNextPage),
    });

    const notifications = query.data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <div className="grid gap-4 md:grid-cols-[225px_1fr] items-start max-w-4xl mx-auto">
            <aside className="hidden md:block md:sticky md:top-20">
                <ProfileSummaryCard />
            </aside>
            <Card className="min-w-0 overflow-visible">
                <div className="flex flex-wrap items-center gap-2 p-4 border-b border-base-300">
                    <h1 className="text-lg font-semibold mr-auto">Notifications</h1>
                    {["all", "unread"].map((id) => (
                        <button
                            key={id}
                            className={cn("btn btn-sm", filter === id ? "btn-success text-success-content" : "btn-ghost border-base-300")}
                            onClick={() => setFilter(id)}
                        >
                            {id === "all" ? "All" : `Unread${unread ? ` (${unread})` : ""}`}
                        </button>
                    ))}
                    <button className="btn btn-ghost btn-sm text-primary" onClick={() => markAll()} disabled={!unread || markingAll}>
                        <CheckCheck className="size-4" /> Mark all read
                    </button>
                </div>

                {query.isPending ? (
                    <ListSkeleton />
                ) : query.isError ? (
                    <ErrorState error={query.error} onRetry={query.refetch} />
                ) : notifications.length ? (
                    <ul className="divide-y divide-base-300">
                        {notifications.map((n) => (
                            <NotificationItem key={n._id} notification={n} />
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        icon={Bell}
                        title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
                        description="Reactions, comments, connection requests and job updates will show up here."
                    />
                )}
                <div ref={sentinel} />
                {query.isFetchingNextPage && <Spinner />}
            </Card>
        </div>
    );
};

export default NotificationsPage;
