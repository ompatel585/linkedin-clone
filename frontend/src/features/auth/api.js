import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, put } from "../../lib/api";
import { AUTH_KEY } from "../../hooks/useAuth";

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentials) => post("/auth/login", credentials),
        onSuccess: (data) => queryClient.setQueryData(AUTH_KEY, data.user),
    });
};

export const useSignup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => post("/auth/signup", data),
        onSuccess: (data) => queryClient.setQueryData(AUTH_KEY, data.user),
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => post("/auth/logout"),
        onSuccess: () => {
            queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== AUTH_KEY[0] });
            queryClient.setQueryData(AUTH_KEY, null);
        },
    });
};

export const useChangePassword = () => useMutation({ mutationFn: (data) => put("/auth/password", data) });
