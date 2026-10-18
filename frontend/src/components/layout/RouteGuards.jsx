import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthUser } from "../../hooks/useAuth";

export const ProtectedRoute = () => {
    const { data: user } = useAuthUser();
    const location = useLocation();
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return <Outlet />;
};

export const PublicOnlyRoute = () => {
    const { data: user } = useAuthUser();
    const location = useLocation();
    if (user) return <Navigate to={location.state?.from || "/"} replace />;
    return <Outlet />;
};
