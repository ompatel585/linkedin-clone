import { Bookmark } from "lucide-react";
import { Card, EmptyState, ErrorState, PostSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useSavedPosts } from "./api";
import PostCard from "./components/PostCard";

const SavedPostsPage = () => {
    useDocumentTitle("Saved posts");
    const { data: posts, isPending, isError, error, refetch } = useSavedPosts();

    return (
        <div className="max-w-2xl mx-auto space-y-3">
            <Card className="p-5">
                <h1 className="text-xl font-semibold">Saved posts</h1>
                <p className="text-sm text-muted">Only you can see what you've saved.</p>
            </Card>
            {isPending ? (
                <PostSkeleton />
            ) : isError ? (
                <ErrorState error={error} onRetry={refetch} />
            ) : posts.length ? (
                posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
                <Card>
                    <EmptyState icon={Bookmark} title="Nothing saved yet" description="Use the ••• menu on any post to save it for later." />
                </Card>
            )}
        </div>
    );
};

export default SavedPostsPage;
