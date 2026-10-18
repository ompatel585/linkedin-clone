import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The dev server proxies the API and websocket so the auth cookie is same-origin.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:5000",
            "/socket.io": { target: "http://localhost:5000", ws: true },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom", "react-router"],
                    query: ["@tanstack/react-query", "axios"],
                },
            },
        },
    },
});
