import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { get } from "../../lib/api";

export const useSearch = (q, type = "all", limit) =>
    useQuery({
        queryKey: ["search", q, type, limit],
        queryFn: () => get("/search", { q, type, limit }),
        enabled: q.trim().length > 0,
        placeholderData: keepPreviousData,
        staleTime: 60_000,
    });
