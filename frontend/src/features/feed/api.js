import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, patch, post } from "../../lib/api";
import { AUTH_KEY } from "../../hooks/useAuth";

export const postKeys = {
    all: ["posts"],
    feed: (scope) => ["posts", "feed", scope],
    user: (username) => ["posts", "user", username],
    hashtag: (tag) => ["posts", "hashtag", tag],
    saved: ["posts", "saved"],
    detail: (id) => ["posts", "detail", id],
};

const infinitePosts = (queryKey, url, params = {}) => ({
    queryKey,
    queryFn: ({ pageParam }) => get(url, { ...params, cursor: pageParam, limit: 10 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

export const useFeed = (scope = "network") =>
    useInfiniteQuery(infinitePosts(postKeys.feed(scope), "/posts", scope === "all" ? { scope: "all" } : {}));

export const useUserPosts = (username) =>
    useInfiniteQuery({ ...infinitePosts(postKeys.user(username), `/posts/user/${username}`), enabled: Boolean(username) });

export const useHashtagPosts = (tag) => useInfiniteQuery(infinitePosts(postKeys.hashtag(tag), `/posts/hashtag/${tag}`));

export const useSavedPosts = () => useQuery({ queryKey: postKeys.saved, queryFn: () => get("/posts/saved") });

export const usePost = (id) => useQuery({ queryKey: postKeys.detail(id), queryFn: () => get(`/posts/${id}`) });

export const useTrendingHashtags = () =>
    useQuery({ queryKey: ["trending"], queryFn: () => get("/posts/trending-hashtags"), staleTime: 5 * 60_000 });

// --- cache helpers: keep every list that contains a post in sync after a mutation ---

const mapPostData = (data, fn) => {
    if (!data) return data;
    if (data.pages) return { ...data, pages: data.pages.map((page) => ({ ...page, items: fn(page.items) })) };
    if (Array.isArray(data)) return fn(data);
    if (data._id) return fn([data])[0] ?? null;
    return data;
};

const patchPost = (queryClient, id, changes) => {
    queryClient.setQueriesData({ queryKey: postKeys.all }, (data) =>
        mapPostData(data, (posts) =>
            posts.map((p) => {
                if (p._id === id) return { ...p, ...changes };
                if (p.repostOf?._id === id) return { ...p, repostOf: { ...p.repostOf, ...changes } };
                return p;
            })
        )
    );
};

const removePost = (queryClient, id) => {
    queryClient.setQueriesData({ queryKey: postKeys.all }, (data) =>
        data?._id === id ? data : mapPostData(data, (posts) => posts.filter((p) => p._id !== id))
    );
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => post("/posts", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
            queryClient.invalidateQueries({ queryKey: ["trending"] });
        },
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }) => patch(`/posts/${id}`, { content }),
        onSuccess: (updated) => patchPost(queryClient, updated._id, updated),
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => del(`/posts/${id}`),
        onSuccess: (_data, id) => {
            removePost(queryClient, id);
            queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
        },
    });
};

export const useReact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, type }) => post(`/posts/${id}/react`, { type }),
        // Optimistic: update the reaction immediately, roll back if the request fails
        onMutate: async ({ id, type, userId, current }) => {
            await queryClient.cancelQueries({ queryKey: postKeys.all });
            const snapshot = queryClient.getQueriesData({ queryKey: postKeys.all });
            const others = current.filter((r) => r.user !== userId);
            const mine = current.find((r) => r.user === userId);
            const reactions = mine?.type === type ? others : [...others, { user: userId, type }];
            patchPost(queryClient, id, { reactions });
            return { snapshot };
        },
        onError: (_error, _vars, context) => context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)),
        onSuccess: (data) => patchPost(queryClient, data._id, { reactions: data.reactions }),
    });
};

export const useAddComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }) => post(`/posts/${id}/comments`, { content }),
        onSuccess: (updated) => patchPost(queryClient, updated._id, { comments: updated.comments }),
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, commentId }) => del(`/posts/${postId}/comments/${commentId}`),
        onSuccess: (updated) => patchPost(queryClient, updated._id, { comments: updated.comments }),
    });
};

export const useRepost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }) => post(`/posts/${id}/repost`, { content }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
    });
};

export const useToggleSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => post(`/posts/${id}/save`),
        onSuccess: ({ saved }, id) => {
            queryClient.setQueryData(AUTH_KEY, (user) =>
                user && {
                    ...user,
                    savedPosts: saved ? [...user.savedPosts, id] : user.savedPosts.filter((p) => p !== id),
                }
            );
            queryClient.invalidateQueries({ queryKey: postKeys.saved });
        },
    });
};
