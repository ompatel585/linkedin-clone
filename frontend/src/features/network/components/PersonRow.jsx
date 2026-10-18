import { Link } from "react-router";
import Avatar from "../../../components/ui/Avatar";
import { useSocket } from "../../../context/SocketContext";
import { useCurrentUser } from "../../../hooks/useAuth";
import { pluralize } from "../../../lib/utils";
import ConnectButton from "./ConnectButton";

// A person with avatar, name, headline and an action (defaults to a Connect button).
const PersonRow = ({ person, compact = false, action, subtitle }) => {
    const { isOnline } = useSocket();
    const me = useCurrentUser();
    const mutual = person.mutualCount;
    // Never offer to connect with yourself (e.g. in search results)
    const isMe = person._id === me._id;

    return (
        <div className="flex gap-3 items-start">
            <Avatar user={person} size={compact ? "sm" : "md"} link online={isOnline(person._id)} showOpenToWork />
            <div className="min-w-0 flex-1">
                <Link to={`/profile/${person.username}`} className="font-semibold hover:underline line-clamp-1">
                    {person.name}
                </Link>
                <p className="text-xs text-muted line-clamp-2">{person.headline}</p>
                {subtitle ?? (mutual > 0 && <p className="text-xs text-muted mt-0.5">{pluralize(mutual, "mutual connection")}</p>)}
                {compact && (
                    <div className="mt-2">
                        {action ?? (!isMe && <ConnectButton userId={person._id} initialStatus="not_connected" size="xs" />)}
                    </div>
                )}
            </div>
            {!compact && <div className="shrink-0 self-center">{action ?? (!isMe && <ConnectButton userId={person._id} />)}</div>}
        </div>
    );
};

export default PersonRow;
