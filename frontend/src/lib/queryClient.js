import { MutationCache, QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "./api";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => error?.response?.status >= 500 && count < 2,
        },
    },
    // Every failed mutation shows a toast unless it opts out with meta.silent
    mutationCache: new MutationCache({
        onError: (error, _vars, _ctx, mutation) => {
            if (!mutation.meta?.silent) toast.error(getErrorMessage(error));
        },
    }),
});
