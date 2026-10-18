import { Suspense } from "react";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import { Spinner } from "../ui/Feedback";
import { SocketProvider } from "../../context/SocketContext";

const AppLayout = () => (
    <SocketProvider>
        <div className="min-h-dvh flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-6xl mx-auto px-0 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
                <Suspense fallback={<Spinner className="py-20" />}>
                    <Outlet />
                </Suspense>
            </main>
            <MobileNav />
        </div>
    </SocketProvider>
);

export default AppLayout;
