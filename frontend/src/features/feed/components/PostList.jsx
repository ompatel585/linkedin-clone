import { Newspaper } from "lucide-react";
import { EmptyState, ErrorState, PostSkeleton, Spinner } from "../../../components/ui/Feedback";
import { useInView } from "../../../hooks/useInView";
import PostCard from "./PostCard";

// Renders an infinite query of posts and loads more as the user scrolls.
const PostList = ({ query, empty }) => {
    const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
    const sentinel = useInView(() => hasNextPage && !isFetchingNextPage && fetchNextPage(), { enabled: Boolean(hasNextPage) });

    if (isPending) {
        return (
            <div className="space-y-3">
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }
    if (isError) return <ErrorState error={error} onRetry={refetch} />;

    const posts = data.pages.flatMap((page) => page.items);
    if (!posts.length) {
        return <div className="card-surface">{empty ?? <EmptyState icon={Newspaper} title="No posts yet" />}</div>;
    }

    return (
        <div className="space-y-3">
            {posts.map((post) => (
                <PostCard key={post._id} post={post} />
            ))}
            <div ref={sentinel} />
            {isFetchingNextPage && <Spinner />}
            {!hasNextPage && posts.length > 5 && <p className="text-center text-sm text-muted py-4">You're all caught up ✨</p>}
        </div>
    );
};

export default PostList;
