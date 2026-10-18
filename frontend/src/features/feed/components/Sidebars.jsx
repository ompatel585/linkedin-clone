import { Link } from "react-router";
import { Bookmark, BriefcaseBusiness, Hash, TrendingUp } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { Card } from "../../../components/ui/Feedback";
import { useCurrentUser } from "../../../hooks/useAuth";
import { formatCount } from "../../../lib/utils";
import { useProfileStats } from "../../profile/api";
import { useSuggestions } from "../../network/api";
import PersonRow from "../../network/components/PersonRow";
import { useTrendingHashtags } from "../api";

export const Banner = ({ user, className = "h-14" }) =>
    user?.bannerImage ? (
        <img src={user.bannerImage} alt="" className={`w-full object-cover ${className}`} />
    ) : (
        <div className={`w-full bg-linear-to-r from-sky-700 via-primary to-indigo-500 ${className}`} />
    );

export const ProfileSummaryCard = () => {
    const me = useCurrentUser();
    const { data: stats } = useProfileStats();

    return (
        <Card className="overflow-hidden">
            <Banner user={me} />
            <div className="px-4 pb-4 -mt-8 text-center">
                <Link to={`/profile/${me.username}`} className="inline-block">
                    <Avatar user={me} size="lg" className="ring-4 ring-base-100 rounded-full" showOpenToWork />
                </Link>
                <Link to={`/profile/${me.username}`} className="block font-semibold text-lg mt-2 hover:underline">
                    {me.name}
                </Link>
                <p className="text-sm text-muted line-clamp-2">{me.headline}</p>
                {me.location && <p className="text-xs text-muted mt-1">{me.location}</p>}
            </div>
            <div className="border-t border-base-300 py-2 text-sm">
                <Link to="/network" className="flex justify-between px-4 py-1.5 hover:bg-base-200">
                    <span className="text-muted">Connections</span>
                    <span className="font-semibold text-primary">{formatCount(me.connections.length)}</span>
                </Link>
                <Link to={`/profile/${me.username}`} className="flex justify-between px-4 py-1.5 hover:bg-base-200">
                    <span className="text-muted">Profile viewers</span>
                    <span className="font-semibold text-primary">{formatCount(stats?.profileViews ?? me.profileViews)}</span>
                </Link>
            </div>
            <div className="border-t border-base-300 py-2 text-sm">
                <Link to="/saved" className="flex items-center gap-2 px-4 py-1.5 hover:bg-base-200 font-medium">
                    <Bookmark className="size-4" /> Saved posts
                </Link>
                <Link to="/jobs/my" className="flex items-center gap-2 px-4 py-1.5 hover:bg-base-200 font-medium">
                    <BriefcaseBusiness className="size-4" /> My jobs
                </Link>
            </div>
        </Card>
    );
};

export const TrendingCard = () => {
    const { data: tags = [] } = useTrendingHashtags();
    if (!tags.length) return null;

    return (
        <Card className="p-4">
            <h2 className="font-semibold flex items-center gap-2 mb-2">
                <TrendingUp className="size-5 text-primary" /> Trending now
            </h2>
            <ul className="space-y-0.5">
                {tags.map(({ tag, count }) => (
                    <li key={tag}>
                        <Link to={`/hashtag/${tag}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-200">
                            <Hash className="size-4 text-muted" />
                            <span className="font-medium truncate">{tag}</span>
                            <span className="ml-auto text-xs text-muted">{formatCount(count)} posts</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export const SuggestionsCard = () => {
    const { data: people = [], isPending } = useSuggestions(4);
    if (isPending || !people.length) return null;

    return (
        <Card className="p-4">
            <h2 className="font-semibold mb-2">People you may know</h2>
            <ul className="space-y-3">
                {people.map((person) => (
                    <li key={person._id}>
                        <PersonRow person={person} compact />
                    </li>
                ))}
            </ul>
            <Link to="/network" className="btn btn-ghost btn-sm w-full mt-3 text-muted">
                See all recommendations
            </Link>
        </Card>
    );
};

export const FooterLinks = () => (
    <p className="text-xs text-muted text-center px-4">
        UnLinked © {new Date().getFullYear()} · Built with the MERN stack
    </p>
);
