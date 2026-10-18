import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { get, post, put } from "../../lib/api";

// Adds a message to a cached thread (pages are newest-first), ignoring duplicates
export const appendMessage = (data, message) => {
    if (!data) return data;
    const [first, ...rest] = data.pages;
    if (first.items.some((m) => m._id === message._id)) return data;
    return { ...data, pages: [{ ...first, items: [message, ...first.items] }, ...rest] };
};

export const useConversations = () => useQuery({ queryKey: ["conversations"], queryFn: () => get("/messages/conversations") });

export const useConversation = (id) =>
    useQuery({
        queryKey: ["conversations", "detail", id],
        queryFn: () => get(`/messages/conversations/${id}`),
        enabled: Boolean(id),
        retry: false,
    });

export const useUnreadMessageCount = () =>
    useQuery({
        queryKey: ["conversations", "unread"],
        queryFn: () => get("/messages/unread-count").then((data) => data.count),
        refetchInterval: 120_000,
    });

export const useMessages = (conversationId) =>
    useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: ({ pageParam }) =>
            get(`/messages/conversations/${conversationId}/messages`, { cursor: pageParam, limit: 30 }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: Boolean(conversationId),
    });

export const useSendMessage = (conversationId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text) => post(`/messages/conversations/${conversationId}/messages`, { text }),
        onSuccess: (message) => {
            queryClient.setQueryData(["messages", conversationId], (data) => appendMessage(data, message));
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

export const useMarkConversationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (conversationId) => put(`/messages/conversations/${conversationId}/read`),
        meta: { silent: true },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    });
};

// Opens (or creates) a conversation with a user and navigates to it.
export const useStartConversation = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (userId) => post("/messages/conversations", { userId }),
        onSuccess: (conversation) => navigate(`/messaging/${conversation._id}`),
    });
};
