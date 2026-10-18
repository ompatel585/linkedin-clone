import { useState } from "react";
import { Link } from "react-router";
import { Link2, MapPin, MessageSquareText, Pencil, Plus, UserCheck } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { Card } from "../../../components/ui/Feedback";
import { useSocket } from "../../../context/SocketContext";
import { pluralize } from "../../../lib/utils";
import { Banner } from "../../feed/components/Sidebars";
import { useStartConversation } from "../../messaging/api";
import ConnectButton from "../../network/components/ConnectButton";
import { useToggleFollow } from "../api";
import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({ profile, isOwnProfile }) => {
    const [editing, setEditing] = useState(false);
    const { isOnline } = useSocket();
    const { mutate: toggleFollow, isPending: following } = useToggleFollow();
    const startConversation = useStartConversation();

    const website = profile.website && (/^https?:\/\//.test(profile.website) ? profile.website : `https://${profile.website}`);

    return (
        <Card className="overflow-hidden">
            <Banner user={profile} className="h-32 sm:h-48" />
            <div className="px-4 sm:px-6 pb-5">
                <div className="flex justify-between items-start">
                    <Avatar
                        user={profile}
                        size="2xl"
                        online={!isOwnProfile && isOnline(profile._id)}
                        showOpenToWork
                        className="-mt-16 sm:-mt-24 ring-4 ring-base-100 rounded-full"
                    />
                    {isOwnProfile && (
                        <button className="btn btn-ghost btn-circle mt-2" onClick={() => setEditing(true)} aria-label="Edit intro">
                            <Pencil className="size-5" />
                        </button>
                    )}
                </div>

                <div className="mt-3">
                    <h1 className="text-2xl font-semibold flex items-center gap-2 flex-wrap">
                        {profile.name}
                        {profile.openToWork && <span className="badge badge-success badge-sm">#OpenToWork</span>}
                    </h1>
                    <p className="text-base mt-0.5">{profile.headline}</p>
                    <p className="text-sm text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="size-4" /> {profile.location}
                            </span>
                        )}
                        {website && (
                            <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 text-primary font-medium hover:underline">
                                <Link2 className="size-4" /> {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                    </p>
                    <p className="text-sm mt-2 flex flex-wrap gap-x-3">
                        {isOwnProfile ? (
                            <Link to="/network" className="text-primary font-semibold hover:underline">
                                {pluralize(profile.connectionCount, "connection")}
                            </Link>
                        ) : (
                            <span className="text-primary font-semibold">{pluralize(profile.connectionCount, "connection")}</span>
                        )}
                        <span className="text-muted">{pluralize(profile.followerCount, "follower")}</span>
                    </p>

                    {!isOwnProfile && profile.mutualConnectionCount > 0 && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted">
                            <span className="flex -space-x-2">
                                {profile.mutualConnections.map((person) => (
                                    <Avatar key={person._id} user={person} size="2xs" className="ring-2 ring-base-100 rounded-full" />
                                ))}
                            </span>
                            {pluralize(profile.mutualConnectionCount, "mutual connection")}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {isOwnProfile ? (
                        <>
                            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                                Edit profile
                            </button>
                            <Link to="/settings" className="btn btn-outline btn-sm">
                                Settings
                            </Link>
                        </>
                    ) : (
                        <>
                            <ConnectButton userId={profile._id} />
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => startConversation.mutate(profile._id)}
                                disabled={startConversation.isPending}
                            >
                                <MessageSquareText className="size-4" /> Message
                            </button>
                            <button
                                className={`btn btn-sm ${profile.isFollowing ? "btn-ghost" : "btn-ghost text-primary"}`}
                                onClick={() => toggleFollow(profile._id)}
                                disabled={following}
                            >
                                {profile.isFollowing ? <UserCheck className="size-4" /> : <Plus className="size-4" />}
                                {profile.isFollowing ? "Following" : "Follow"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {editing && <EditProfileModal user={profile} open onClose={() => setEditing(false)} />}
        </Card>
    );
};

export default ProfileHeader;
