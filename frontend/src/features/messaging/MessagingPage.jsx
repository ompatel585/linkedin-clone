import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { MessageSquareText, Search } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { EmptyState, ListSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cn } from "../../lib/utils";
import { useConnections } from "../network/api";
import Avatar from "../../components/ui/Avatar";
import { useStartConversation } from "./api";
import ChatThread from "./components/ChatThread";
import ConversationList from "./components/ConversationList";

const NewMessageModal = ({ open, onClose }) => {
    const { data: connections = [], isPending } = useConnections();
    const [filter, setFilter] = useState("");
    const start = useStartConversation();

    const filtered = useMemo(() => {
        const term = filter.trim().toLowerCase();
        return term ? connections.filter((c) => c.name.toLowerCase().includes(term)) : connections;
    }, [connections, filter]);

    return (
        <Modal open={open} onClose={onClose} title="New message">
            <label className="input w-full mb-3">
                <Search className="size-4 opacity-60" />
                <input placeholder="Search your connections" value={filter} onChange={(e) => setFilter(e.target.value)} data-autofocus />
            </label>
            {isPending ? (
                <ListSkeleton rows={3} />
            ) : filtered.length ? (
                <ul className="space-y-1">
                    {filtered.map((person) => (
                        <li key={person._id}>
                            <button
                                className="w-full text-left rounded-box p-2 hover:bg-base-200"
                                onClick={() => start.mutate(person._id, { onSuccess: onClose })}
                            >
                                <span className="flex items-center gap-3">
                                    <Avatar user={person} size="sm" />
                                    <span className="min-w-0">
                                        <span className="block font-semibold truncate">{person.name}</span>
                                        <span className="block text-xs text-muted truncate">{person.headline}</span>
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted py-4 text-center">
                    {connections.length ? "No matching connections." : "Connect with people to message them, or use the Message button on any profile."}
                </p>
            )}
        </Modal>
    );
};

const MessagingPage = () => {
    const { conversationId } = useParams();
    const [composing, setComposing] = useState(false);
    useDocumentTitle("Messaging");

    return (
        <div className="card-surface overflow-hidden grid md:grid-cols-[320px_1fr] h-[calc(100dvh-8.5rem)] md:h-[calc(100dvh-7.5rem)] sm:rounded-box rounded-none">
            <aside className={cn("md:border-r border-base-300 min-h-0", conversationId ? "hidden md:block" : "block")}>
                <ConversationList onNewMessage={() => setComposing(true)} />
            </aside>
            <section className={cn("min-h-0", conversationId ? "block" : "hidden md:block")}>
                {conversationId ? (
                    <ChatThread key={conversationId} conversationId={conversationId} />
                ) : (
                    <div className="h-full grid place-items-center">
                        <EmptyState
                            icon={MessageSquareText}
                            title="Your messages"
                            description="Pick a conversation or start a new one. Messages arrive instantly."
                            action={
                                <button className="btn btn-primary btn-sm" onClick={() => setComposing(true)}>
                                    New message
                                </button>
                            }
                        />
                    </div>
                )}
            </section>
            <NewMessageModal open={composing} onClose={() => setComposing(false)} />
        </div>
    );
};

export default MessagingPage;
