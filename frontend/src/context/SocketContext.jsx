import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { socket } from "../lib/socket";
import { useAuthUser } from "../hooks/useAuth";
import { notificationText } from "../features/notifications/notificationText";
import { appendMessage } from "../features/messaging/api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [onlineUsers, setOnlineUsers] = useState(() => new Set());
    const [typing, setTyping] = useState({}); // conversationId -> boolean
    const activeConversation = useRef(null);
    const typingTimers = useRef({});

    const userId = authUser?._id;

    useEffect(() => {
        if (!userId) return;
        socket.connect();

        const onPresenceList = (ids) => setOnlineUsers(new Set(ids));
        const onPresenceUpdate = ({ userId: id, online }) =>
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                if (online) next.add(id);
                else next.delete(id);
                return next;
            });

        const onNotification = (notification) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            if (["connectionRequest", "connectionAccepted"].includes(notification.type)) {
                queryClient.invalidateQueries({ queryKey: ["network"] });
            }
            const actor = notification.relatedUser?.name || "Someone";
            toast(`${actor} ${notificationText(notification)}`, { icon: "🔔" });
        };

        const onMessage = ({ conversationId, message }) => {
            queryClient.setQueryData(["messages", conversationId], (data) => appendMessage(data, message));
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            const fromOther = message.sender !== userId;
            if (fromOther) {
                setTyping((prev) => ({ ...prev, [conversationId]: false }));
                if (activeConversation.current !== conversationId) toast("New message", { icon: "💬" });
            }
        };

        const onRead = ({ conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        const onTyping = ({ conversationId, isTyping }) => {
            setTyping((prev) => ({ ...prev, [conversationId]: isTyping }));
            clearTimeout(typingTimers.current[conversationId]);
            if (isTyping) {
                // Fall back to "not typing" if the stop event never arrives
                typingTimers.current[conversationId] = setTimeout(
                    () => setTyping((prev) => ({ ...prev, [conversationId]: false })),
                    5000
                );
            }
        };

        socket.on("presence:list", onPresenceList);
        socket.on("presence:update", onPresenceUpdate);
        socket.on("notification:new", onNotification);
        socket.on("message:new", onMessage);
        socket.on("conversation:read", onRead);
        socket.on("typing", onTyping);

        return () => {
            socket.off("presence:list", onPresenceList);
            socket.off("presence:update", onPresenceUpdate);
            socket.off("notification:new", onNotification);
            socket.off("message:new", onMessage);
            socket.off("conversation:read", onRead);
            socket.off("typing", onTyping);
            socket.disconnect();
        };
    }, [userId, queryClient]);

    const isOnline = useCallback((id) => Boolean(id) && onlineUsers.has(String(id)), [onlineUsers]);

    const sendTyping = useCallback((conversationId, isTyping) => {
        socket.emit("typing", { conversationId, isTyping });
    }, []);

    const setActiveConversation = useCallback((id) => {
        activeConversation.current = id;
    }, []);

    return (
        <SocketContext.Provider value={{ isOnline, typing, sendTyping, setActiveConversation }}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
