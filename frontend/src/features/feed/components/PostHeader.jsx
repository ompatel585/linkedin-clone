import { Link } from "react-router";
import { Globe } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useSocket } from "../../../context/SocketContext";
import { useCurrentUser } from "../../../hooks/useAuth";
import { timeAgo } from "../../../lib/utils";

const PostHeader = ({ author, createdAt, editedAt, postId, size = "md", children }) => {
    const { isOnline } = useSocket();
    const me = useCurrentUser();

    return (
        <div className="flex items-start gap-3">
            <Avatar user={author} size={size} link online={author?._id !== me._id && isOnline(author?._id)} showOpenToWork />
            <div className="min-w-0 flex-1">
                {author ? (
                    <Link to={`/profile/${author.username}`} className="font-semibold hover:text-primary hover:underline">
                        {author.name}
                    </Link>
                ) : (
                    <span className="font-semibold">Deleted user</span>
                )}
                {author?.headline && <p className="text-xs text-muted line-clamp-1">{author.headline}</p>}
                <p className="text-xs text-muted flex items-center gap-1">
                    {postId ? (
                        <Link to={`/post/${postId}`} className="hover:underline">
                            {timeAgo(createdAt)}
                        </Link>
                    ) : (
                        timeAgo(createdAt)
                    )}
                    {editedAt && <span>· Edited</span>}
                    <span>·</span>
                    <Globe className="size-3" aria-label="Public" />
                </p>
            </div>
            {children}
        </div>
    );
};

export default PostHeader;
