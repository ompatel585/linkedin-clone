import { io } from "socket.io-client";

// One shared connection, opened after login. The auth cookie is sent automatically.
export const socket = io({
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
});
