import { useParams } from "react-router";
import { BarChart3, Eye, Users } from "lucide-react";
import NotFoundPage from "../../components/layout/NotFoundPage";
import { Card, EmptyState, ErrorState, PostSkeleton } from "../../components/ui/Feedback";
import { useCurrentUser } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCount } from "../../lib/utils";
import { useUserPosts } from "../feed/api";
import PostList from "../feed/components/PostList";
import { SuggestionsCard } from "../feed/components/Sidebars";
import { useProfile } from "./api";
import ProfileHeader from "./components/ProfileHeader";
import { AboutSection, EducationSection, ExperienceSection, SkillsSection } from "./components/ProfileSections";

const AnalyticsCard = ({ profile }) => (
    <Card className="p-5">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="size-5" /> Analytics
        </h2>
        <p className="text-xs text-muted flex items-center gap-1 mb-3">
            <Eye className="size-3.5" /> Private to you
        </p>
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-box border border-base-300 p-3">
                <p className="text-2xl font-semibold">{formatCount(profile.profileViews)}</p>
                <p className="text-sm text-muted">profile views</p>
            </div>
            <div className="rounded-box border border-base-300 p-3">
                <p className="text-2xl font-semibold flex items-center gap-1">{formatCount(profile.followerCount)}</p>
                <p className="text-sm text-muted">followers</p>
            </div>
        </div>
    </Card>
);

const ActivitySection = ({ username, isOwnProfile }) => {
    const query = useUserPosts(username);
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold px-4 sm:px-1 pt-2">Activity</h2>
            <PostList
                query={query}
                empty={<EmptyState icon={Users} title={isOwnProfile ? "You haven't posted yet" : "No posts yet"} description={isOwnProfile ? "Posts you share will appear here." : undefined} />}
            />
        </section>
    );
};

const ProfilePage = () => {
    const { username } = useParams();
    const me = useCurrentUser();
    const { data: profile, isPending, isError, error, refetch } = useProfile(username.toLowerCase());
    useDocumentTitle(profile?.name ?? "Profile");

    if (isError && error.response?.status === 404) {
        return <NotFoundPage title="Profile not found" description={`There's no member with the username “${username}”.`} />;
    }
    if (isError) return <ErrorState error={error} onRetry={refetch} />;
    if (isPending) return <PostSkeleton />;

    const isOwnProfile = profile._id === me._id;

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-start">
            <div className="space-y-3 min-w-0">
                <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
                {isOwnProfile && <AnalyticsCard profile={profile} />}
                {/* key resets local edit state when switching between profiles */}
                <div key={profile._id} className="space-y-3">
                    <AboutSection profile={profile} isOwnProfile={isOwnProfile} />
                    <ExperienceSection profile={profile} isOwnProfile={isOwnProfile} />
                    <EducationSection profile={profile} isOwnProfile={isOwnProfile} />
                    <SkillsSection profile={profile} isOwnProfile={isOwnProfile} />
                </div>
                <ActivitySection username={profile.username} isOwnProfile={isOwnProfile} />
            </div>
            <aside className="hidden lg:block lg:sticky lg:top-20">
                <SuggestionsCard />
            </aside>
        </div>
    );
};

export default ProfilePage;
