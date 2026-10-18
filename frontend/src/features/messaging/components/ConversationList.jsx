import { useMemo, useState } from "react";
import { NavLink } from "react-router";
import { MessageSquareText, Search, SquarePen } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { EmptyState, ListSkeleton } from "../../../components/ui/Feedback";
import { useSocket } from "../../../context/SocketContext";
import { useCurrentUser } from "../../../hooks/useAuth";
import { cn, timeAgo } from "../../../lib/utils";
import { useConversations } from "../api";

const ConversationList = ({ onNewMessage }) => {
    const me = useCurrentUser();
    const { isOnline, typing } = useSocket();
    const { data: conversations = [], isPending } = useConversations();
    const [filter, setFilter] = useState("");

    const filtered = useMemo(() => {
        const term = filter.trim().toLowerCase();
        return term ? conversations.filter((c) => c.participant?.name.toLowerCase().includes(term)) : conversations;
    }, [conversations, filter]);

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center gap-2 p-3 border-b border-base-300">
                <h1 className="font-semibold text-lg mr-auto">Messaging</h1>
                <button className="btn btn-ghost btn-circle btn-sm" onClick={onNewMessage} aria-label="New message">
                    <SquarePen className="size-5" />
                </button>
            </div>
            <div className="p-3 border-b border-base-300">
                <label className="input input-sm w-full bg-base-200 border-transparent">
                    <Search className="size-4 opacity-60" />
                    <input placeholder="Search messages" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search conversations" />
                </label>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isPending ? (
                    <ListSkeleton />
                ) : !filtered.length ? (
                    <EmptyState
                        icon={MessageSquareText}
                        title={filter ? "No matches" : "No messages yet"}
                        description={filter ? undefined : "Start a conversation with one of your connections."}
                        action={
                            !filter && (
                                <button className="btn btn-primary btn-sm" onClick={onNewMessage}>
                                    New message
                                </button>
                            )
                        }
                    />
                ) : (
                    <ul>
                        {filtered.map((c) => {
                            const fromMe = c.lastMessage?.sender === me._id;
                            return (
                                <li key={c._id}>
                                    <NavLink
                                        to={`/messaging/${c._id}`}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex gap-3 px-3 py-3 border-l-4 transition-colors",
                                                isActive ? "border-primary bg-secondary/50" : "border-transparent hover:bg-base-200"
                                            )
                                        }
                                    >
                                        <Avatar user={c.participant} size="md" online={isOnline(c.participant?._id)} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("truncate", c.unreadCount ? "font-bold" : "font-medium")}>
                                                    {c.participant?.name ?? "Deleted user"}
                                                </span>
                                                <span className="ml-auto text-xs text-muted shrink-0">{timeAgo(c.lastMessageAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm truncate", c.unreadCount ? "font-semibold" : "text-muted")}>
                                                    {typing[c._id] ? (
                                                        <span className="text-primary italic">typing…</span>
                                                    ) : (
                                                        <>
                                                            {fromMe && "You: "}
                                                            {c.lastMessage?.text}
                                                        </>
                                                    )}
                                                </p>
                                                {c.unreadCount > 0 && <span className="badge badge-primary badge-sm ml-auto">{c.unreadCount}</span>}
                                            </div>
                                        </div>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
