import { useParams } from "react-router";
import NotFoundPage from "../../components/layout/NotFoundPage";
import { ErrorState, PostSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePost } from "./api";
import PostCard from "./components/PostCard";
import { ProfileSummaryCard } from "./components/Sidebars";

const PostPage = () => {
    const { postId } = useParams();
    const { data: post, isPending, isError, error, refetch } = usePost(postId);
    useDocumentTitle(post ? `${post.author?.name}'s post` : "Post");

    if (isError && error.response?.status === 404) {
        return <NotFoundPage title="Post not found" description="It may have been deleted by its author." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-[225px_1fr] items-start max-w-4xl mx-auto">
            <aside className="hidden md:block md:sticky md:top-20">
                <ProfileSummaryCard />
            </aside>
            <div className="min-w-0">
                {isPending ? <PostSkeleton /> : isError ? <ErrorState error={error} onRetry={refetch} /> : <PostCard post={post} defaultShowComments />}
            </div>
        </div>
    );
};

export default PostPage;
