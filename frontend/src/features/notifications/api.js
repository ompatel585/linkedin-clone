import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, put } from "../../lib/api";

export const useNotifications = (filter = "all") =>
    useInfiniteQuery({
        queryKey: ["notifications", "list", filter],
        queryFn: ({ pageParam }) =>
            get("/notifications", { cursor: pageParam, limit: 20, unread: filter === "unread" ? "true" : undefined }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

export const useUnreadNotificationCount = () =>
    useQuery({
        queryKey: ["notifications", "unread"],
        queryFn: () => get("/notifications/unread-count").then((data) => data.count),
        refetchInterval: 120_000,
    });

const useNotificationMutation = (mutationFn) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
};

export const useMarkNotificationRead = () => useNotificationMutation((id) => put(`/notifications/${id}/read`));
export const useMarkAllNotificationsRead = () => useNotificationMutation(() => put("/notifications/read-all"));
export const useDeleteNotification = () => useNotificationMutation((id) => del(`/notifications/${id}`));
