import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "../../lib/api";
import { AUTH_KEY } from "../../hooks/useAuth";

export const profileKey = (username) => ["profile", username];

export const useProfile = (username) =>
    useQuery({ queryKey: profileKey(username), queryFn: () => get(`/users/${username}`), retry: false });

export const useProfileStats = () => useQuery({ queryKey: ["profile", "stats"], queryFn: () => get("/users/me/stats") });

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => put("/users/profile", data),
        onSuccess: (user) => {
            queryClient.setQueryData(AUTH_KEY, user);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};

export const useToggleFollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => post(`/users/${userId}/follow`),
        onSuccess: ({ following }, userId) => {
            queryClient.setQueryData(AUTH_KEY, (user) =>
                user && {
                    ...user,
                    following: following ? [...user.following, userId] : user.following.filter((id) => id !== userId),
                }
            );
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
        },
    });
};
