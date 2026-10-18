import { useMemo, useState } from "react";
import { MessageSquareText, Search, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Card, EmptyState, ListSkeleton } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { pluralize, timeAgo } from "../../lib/utils";
import { useStartConversation } from "../messaging/api";
import { useAcceptRequest, useConnectionRequests, useConnections, useRejectRequest, useSentRequests, useSuggestions, useWithdrawRequest } from "./api";
import PersonCard from "./components/PersonCard";
import PersonRow from "./components/PersonRow";

const Invitations = () => {
    const { data: requests = [], isPending } = useConnectionRequests();
    const accept = useAcceptRequest();
    const reject = useRejectRequest();

    if (isPending) return <ListSkeleton rows={2} />;
    if (!requests.length) return <p className="px-4 py-6 text-sm text-muted">No pending invitations.</p>;

    return (
        <ul className="divide-y divide-base-300">
            {requests.map((request) => (
                <li key={request._id} className="p-4">
                    <PersonRow
                        person={request.sender}
                        subtitle={<p className="text-xs text-muted mt-0.5">Sent {timeAgo(request.createdAt)}</p>}
                        action={
                            <div className="flex gap-2">
                                <button className="btn btn-ghost btn-sm" onClick={() => reject.mutate(request._id)}>
                                    Ignore
                                </button>
                                <button
                                    className="btn btn-primary btn-outline btn-sm"
                                    onClick={() => accept.mutate(request._id, { onSuccess: () => toast.success(`You're now connected with ${request.sender.name}`) })}
                                >
                                    Accept
                                </button>
                            </div>
                        }
                    />
                </li>
            ))}
        </ul>
    );
};

const SentInvitations = () => {
    const { data: sent = [], isPending } = useSentRequests();
    const withdraw = useWithdrawRequest();

    if (isPending) return <ListSkeleton rows={2} />;
    if (!sent.length) return <p className="px-4 py-6 text-sm text-muted">You haven't sent any invitations.</p>;

    return (
        <ul className="divide-y divide-base-300">
            {sent.map((request) => (
                <li key={request._id} className="p-4">
                    <PersonRow
                        person={request.recipient}
                        subtitle={<p className="text-xs text-muted mt-0.5">Sent {timeAgo(request.createdAt)}</p>}
                        action={
                            <button className="btn btn-ghost btn-sm" onClick={() => withdraw.mutate(request.recipient._id)}>
                                Withdraw
                            </button>
                        }
                    />
                </li>
            ))}
        </ul>
    );
};

const Connections = () => {
    const { data: connections = [], isPending } = useConnections();
    const [filter, setFilter] = useState("");
    const startConversation = useStartConversation();

    const filtered = useMemo(() => {
        const term = filter.trim().toLowerCase();
        return term ? connections.filter((c) => `${c.name} ${c.headline}`.toLowerCase().includes(term)) : connections;
    }, [connections, filter]);

    if (isPending) return <ListSkeleton />;
    if (!connections.length) {
        return <EmptyState icon={Users} title="No connections yet" description="Accept invitations or connect with people you may know." />;
    }

    return (
        <>
            <div className="p-4 border-b border-base-300">
                <label className="input input-sm w-full sm:w-72">
                    <Search className="size-4 opacity-60" />
                    <input placeholder="Search by name or headline" value={filter} onChange={(e) => setFilter(e.target.value)} />
                </label>
            </div>
            <ul className="divide-y divide-base-300">
                {filtered.map((person) => (
                    <li key={person._id} className="p-4">
                        <PersonRow
                            person={person}
                            action={
                                <button className="btn btn-outline btn-sm" onClick={() => startConversation.mutate(person._id)}>
                                    <MessageSquareText className="size-4" /> Message
                                </button>
                            }
                        />
                    </li>
                ))}
            </ul>
        </>
    );
};

const TABS = {
    invitations: "Invitations",
    connections: "Connections",
    sent: "Sent",
};

const NetworkPage = () => {
    useDocumentTitle("My Network");
    const [tab, setTab] = useState("invitations");
    const { data: requests = [] } = useConnectionRequests();
    const { data: connections = [] } = useConnections();
    const { data: suggestions = [], isPending: loadingSuggestions } = useSuggestions(12);

    const counts = { invitations: requests.length, connections: connections.length };

    return (
        <div className="space-y-4">
            <Card>
                <div role="tablist" className="tabs tabs-border px-2">
                    {Object.entries(TABS).map(([id, label]) => (
                        <button key={id} role="tab" className={`tab ${tab === id ? "tab-active font-semibold" : ""}`} onClick={() => setTab(id)}>
                            {label}
                            {counts[id] > 0 && <span className="badge badge-sm badge-primary ml-2">{counts[id]}</span>}
                        </button>
                    ))}
                </div>
                <div className="border-t border-base-300">
                    {tab === "invitations" && <Invitations />}
                    {tab === "connections" && <Connections />}
                    {tab === "sent" && <SentInvitations />}
                </div>
            </Card>

            <Card className="p-4">
                <h2 className="font-semibold mb-1 flex items-center gap-2">
                    <UserPlus className="size-5 text-primary" /> People you may know
                </h2>
                <p className="text-sm text-muted mb-4">
                    Based on your network{suggestions.length > 0 && ` · ${pluralize(suggestions.length, "suggestion")}`}
                </p>
                {loadingSuggestions ? (
                    <ListSkeleton rows={2} />
                ) : suggestions.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {suggestions.map((person) => (
                            <PersonCard key={person._id} person={person} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted">No suggestions right now. Check back later!</p>
                )}
            </Card>
        </div>
    );
};

export default NetworkPage;
