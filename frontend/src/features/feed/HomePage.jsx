import { useState } from "react";
import { Users } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cn } from "../../lib/utils";
import { useFeed } from "./api";
import PostComposer from "./components/PostComposer";
import PostList from "./components/PostList";
import { FooterLinks, ProfileSummaryCard, SuggestionsCard, TrendingCard } from "./components/Sidebars";

const TABS = [
    { id: "network", label: "Your network" },
    { id: "all", label: "Discover" },
];

const HomePage = () => {
    useDocumentTitle("Feed");
    const [scope, setScope] = useState("network");
    const feed = useFeed(scope);

    return (
        <div className="grid gap-4 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_1fr_300px] items-start">
            <aside className="hidden md:block md:sticky md:top-20">
                <ProfileSummaryCard />
            </aside>

            <div className="space-y-3 min-w-0">
                <PostComposer />
                <div role="tablist" className="flex gap-1 px-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={scope === tab.id}
                            className={cn(
                                "btn btn-sm",
                                scope === tab.id ? "btn-success text-success-content" : "btn-ghost border-base-300 bg-base-100"
                            )}
                            onClick={() => setScope(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <PostList
                    query={feed}
                    empty={
                        <EmptyState
                            icon={Users}
                            title="Your feed is quiet"
                            description="Connect with people or follow them to see their posts here, or browse Discover."
                            action={
                                <div className="flex gap-2 justify-center">
                                    <Link to="/network" className="btn btn-primary btn-sm">
                                        Grow your network
                                    </Link>
                                    <button className="btn btn-outline btn-sm" onClick={() => setScope("all")}>
                                        Discover posts
                                    </button>
                                </div>
                            }
                        />
                    }
                />
            </div>

            <aside className="hidden lg:block space-y-3 lg:sticky lg:top-20">
                <TrendingCard />
                <SuggestionsCard />
                <FooterLinks />
            </aside>
        </div>
    );
};

export default HomePage;
