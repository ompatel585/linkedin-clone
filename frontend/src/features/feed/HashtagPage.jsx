import { useParams } from "react-router";
import { Hash } from "lucide-react";
import { Card, EmptyState } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useHashtagPosts } from "./api";
import PostList from "./components/PostList";
import { TrendingCard } from "./components/Sidebars";

const HashtagPage = () => {
    const { tag } = useParams();
    useDocumentTitle(`#${tag}`);
    const query = useHashtagPosts(tag.toLowerCase());

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-start max-w-5xl mx-auto">
            <div className="space-y-3 min-w-0">
                <Card className="p-5 flex items-center gap-4">
                    <div className="size-14 rounded-box bg-secondary text-secondary-content grid place-items-center">
                        <Hash className="size-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">#{tag}</h1>
                        <p className="text-sm text-muted">Posts that mention this hashtag</p>
                    </div>
                </Card>
                <PostList query={query} empty={<EmptyState icon={Hash} title={`No posts with #${tag} yet`} description="Be the first to start the conversation." />} />
            </div>
            <aside className="hidden lg:block lg:sticky lg:top-20">
                <TrendingCard />
            </aside>
        </div>
    );
};

export default HashtagPage;
