import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./app/router";
import { Spinner } from "./components/ui/Feedback";
import { useAuthUser } from "./hooks/useAuth";

const SplashScreen = () => (
    <div className="min-h-dvh grid place-items-center">
        <img src="/logo-mark.svg" alt="UnLinked" className="size-14 rounded-lg animate-pulse" />
    </div>
);

const App = () => {
    const { isPending } = useAuthUser();

    return (
        <>
            {isPending ? (
                <SplashScreen />
            ) : (
                <Suspense fallback={<Spinner className="min-h-dvh items-center" />}>
                    <AppRoutes />
                </Suspense>
            )}
            <Toaster
                position="bottom-left"
                toastOptions={{
                    className: "bg-base-100! text-base-content! border! border-base-300! shadow-lg!",
                }}
            />
        </>
    );
};

export default App;
