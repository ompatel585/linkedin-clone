import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put } from "../../lib/api";
import { AUTH_KEY } from "../../hooks/useAuth";

export const networkKeys = {
    all: ["network"],
    requests: ["network", "requests"],
    sent: ["network", "sent"],
    connections: ["network", "connections"],
    suggestions: (limit) => ["network", "suggestions", limit],
    status: (userId) => ["network", "status", userId],
};

export const useConnectionRequests = () =>
    useQuery({ queryKey: networkKeys.requests, queryFn: () => get("/connections/requests") });

export const useSentRequests = () => useQuery({ queryKey: networkKeys.sent, queryFn: () => get("/connections/requests/sent") });

export const useConnections = () => useQuery({ queryKey: networkKeys.connections, queryFn: () => get("/connections") });

export const useSuggestions = (limit = 5) =>
    useQuery({ queryKey: networkKeys.suggestions(limit), queryFn: () => get("/users/suggestions", { limit }) });

export const useConnectionStatus = (userId, enabled = true) =>
    useQuery({
        queryKey: networkKeys.status(userId),
        queryFn: () => get(`/connections/status/${userId}`),
        enabled: Boolean(userId) && enabled,
    });

// All connection mutations refresh network data, profiles and the current user's connection list.
const useNetworkMutation = (mutationFn) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: networkKeys.all });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: AUTH_KEY });
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
        },
    });
};

export const useSendRequest = () => useNetworkMutation((userId) => post(`/connections/request/${userId}`));
export const useWithdrawRequest = () => useNetworkMutation((userId) => del(`/connections/request/${userId}`));
export const useAcceptRequest = () => useNetworkMutation((requestId) => put(`/connections/accept/${requestId}`));
export const useRejectRequest = () => useNetworkMutation((requestId) => put(`/connections/reject/${requestId}`));
export const useRemoveConnection = () => useNetworkMutation((userId) => del(`/connections/${userId}`));
