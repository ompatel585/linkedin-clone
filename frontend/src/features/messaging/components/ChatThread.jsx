import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { ArrowLeft, CheckCheck, SendHorizontal } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { ErrorState, Spinner } from "../../../components/ui/Feedback";
import { useSocket } from "../../../context/SocketContext";
import { useCurrentUser } from "../../../hooks/useAuth";
import { cn, formatMessageTime, timeAgo } from "../../../lib/utils";
import { useConversation, useMarkConversationRead, useMessages, useSendMessage } from "../api";

const dayLabel = (date) => (isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "EEEE, MMM d"));

const Composer = ({ conversationId }) => {
    const [text, setText] = useState("");
    const { sendTyping } = useSocket();
    const { mutate: send, isPending } = useSendMessage(conversationId);
    const typingTimer = useRef(null);
    const isTyping = useRef(false);

    const stopTyping = () => {
        clearTimeout(typingTimer.current);
        if (isTyping.current) sendTyping(conversationId, false);
        isTyping.current = false;
    };

    useEffect(() => stopTyping, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const onChange = (e) => {
        setText(e.target.value);
        if (!isTyping.current) {
            isTyping.current = true;
            sendTyping(conversationId, true);
        }
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(stopTyping, 2000);
    };

    const submit = (e) => {
        e?.preventDefault();
        const message = text.trim();
        if (!message || isPending) return;
        stopTyping();
        send(message, { onSuccess: () => setText("") });
    };

    return (
        <form onSubmit={submit} className="border-t border-base-300 p-3 flex items-end gap-2">
            <textarea
                className="textarea flex-1 min-h-11 max-h-36 resize-none bg-base-200 border-transparent focus:bg-base-100"
                rows={1}
                placeholder="Write a message…"
                value={text}
                onChange={onChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) submit(e);
                }}
                maxLength={4000}
                aria-label="Message"
            />
            <button type="submit" className="btn btn-primary btn-circle" disabled={!text.trim() || isPending} aria-label="Send">
                {isPending ? <span className="loading loading-spinner loading-sm" /> : <SendHorizontal className="size-5" />}
            </button>
        </form>
    );
};

const ChatThread = ({ conversationId }) => {
    const me = useCurrentUser();
    const { isOnline, typing, setActiveConversation } = useSocket();
    const { data: conversation, isError, error } = useConversation(conversationId);
    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId);
    const { mutate: markRead } = useMarkConversationRead();
    const scrollRef = useRef(null);
    const keepOffset = useRef(null);

    // Oldest first for display
    const messages = data ? data.pages.flatMap((p) => p.items).toReversed() : [];
    const newestId = messages.at(-1)?._id;
    const participant = conversation?.participant;
    const unreadFromOther = messages.some((m) => m.sender !== me._id && !m.readBy.includes(me._id));

    useEffect(() => {
        setActiveConversation(conversationId);
        return () => setActiveConversation(null);
    }, [conversationId, setActiveConversation]);

    useEffect(() => {
        if (unreadFromOther) markRead(conversationId);
    }, [unreadFromOther, conversationId, markRead]);

    // Stick to the bottom for new messages, but keep position when older ones load above
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (keepOffset.current !== null) {
            el.scrollTop = el.scrollHeight - keepOffset.current;
            keepOffset.current = null;
        } else {
            el.scrollTop = el.scrollHeight;
        }
    }, [newestId, messages.length, typing[conversationId]]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadOlder = () => {
        keepOffset.current = scrollRef.current.scrollHeight - scrollRef.current.scrollTop;
        fetchNextPage();
    };

    if (isError) return <ErrorState error={error} />;

    const online = isOnline(participant?._id);
    const lastMine = [...messages].reverse().find((m) => m.sender === me._id);
    const seen = lastMine && participant && lastMine.readBy.includes(participant._id);

    return (
        <div className="flex flex-col h-full min-h-0">
            <header className="flex items-center gap-3 p-3 border-b border-base-300">
                <Link to="/messaging" className="btn btn-ghost btn-circle btn-sm md:hidden" aria-label="Back to conversations">
                    <ArrowLeft className="size-5" />
                </Link>
                {participant && (
                    <>
                        <Avatar user={participant} size="sm" link online={online} />
                        <div className="min-w-0">
                            <Link to={`/profile/${participant.username}`} className="font-semibold hover:underline block truncate">
                                {participant.name}
                            </Link>
                            <p className="text-xs text-muted truncate">
                                {typing[conversationId] ? (
                                    <span className="text-primary">typing…</span>
                                ) : online ? (
                                    "Active now"
                                ) : participant.lastSeen ? (
                                    `Active ${timeAgo(participant.lastSeen)} ago`.replace("now ago", "just now")
                                ) : (
                                    participant.headline
                                )}
                            </p>
                        </div>
                    </>
                )}
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
                {isPending ? (
                    <Spinner />
                ) : (
                    <>
                        {hasNextPage && (
                            <div className="text-center mb-3">
                                <button className="btn btn-ghost btn-xs" onClick={loadOlder} disabled={isFetchingNextPage}>
                                    {isFetchingNextPage ? "Loading…" : "Load earlier messages"}
                                </button>
                            </div>
                        )}
                        {!messages.length && participant && (
                            <div className="text-center py-10">
                                <Avatar user={participant} size="xl" className="mx-auto" />
                                <p className="font-semibold mt-3">{participant.name}</p>
                                <p className="text-sm text-muted">{participant.headline}</p>
                                <p className="text-sm text-muted mt-4">Say hello 👋</p>
                            </div>
                        )}
                        {messages.map((message, i) => {
                            const mine = message.sender === me._id;
                            const date = new Date(message.createdAt);
                            const prev = messages[i - 1];
                            const newDay = !prev || !isSameDay(new Date(prev.createdAt), date);
                            const grouped = prev && prev.sender === message.sender && !newDay && date - new Date(prev.createdAt) < 5 * 60_000;

                            return (
                                <Fragment key={message._id}>
                                    {newDay && (
                                        <div className="divider text-xs text-muted my-4">{dayLabel(date)}</div>
                                    )}
                                    <div className={cn("flex", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-3")}>
                                        <div
                                            title={formatMessageTime(message.createdAt)}
                                            className={cn(
                                                "max-w-[80%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl whitespace-pre-wrap break-words text-[15px]",
                                                mine ? "bg-primary text-primary-content rounded-br-md" : "bg-base-200 rounded-bl-md"
                                            )}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                    {!grouped && i === messages.length - 1 && (
                                        <p className={cn("text-[11px] text-muted mt-1", mine ? "text-right" : "text-left")}>
                                            {formatMessageTime(message.createdAt)}
                                        </p>
                                    )}
                                </Fragment>
                            );
                        })}
                        {seen && lastMine._id === newestId && (
                            <p className="text-[11px] text-muted text-right mt-1 flex items-center justify-end gap-1">
                                <CheckCheck className="size-3.5 text-primary" /> Seen
                            </p>
                        )}
                        {typing[conversationId] && (
                            <div className="flex mt-3">
                                <div className="bg-base-200 rounded-2xl rounded-bl-md px-4 py-3">
                                    <span className="loading loading-dots loading-sm" />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Composer conversationId={conversationId} />
        </div>
    );
};

export default ChatThread;
