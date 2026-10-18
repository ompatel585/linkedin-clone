import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { queryClient } from "./lib/queryClient";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>
);
