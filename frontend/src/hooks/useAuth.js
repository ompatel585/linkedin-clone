import { useQuery } from "@tanstack/react-query";
import { get } from "../lib/api";

export const AUTH_KEY = ["authUser"];

const fetchMe = async () => {
    try {
        return await get("/auth/me");
    } catch (error) {
        if (error.response?.status === 401) return null;
        throw error;
    }
};

export const useAuthUser = () => useQuery({ queryKey: AUTH_KEY, queryFn: fetchMe, staleTime: Infinity });

// Inside protected routes the user is always loaded, so this never returns null there.
export const useCurrentUser = () => useAuthUser().data;
