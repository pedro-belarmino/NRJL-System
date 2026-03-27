import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function PrivateWrapper() {
    const { user, profile, loading, isAuthorized } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress color="warning" />
            </Box>
        );
    }

    if (!user || !isAuthorized) {
        return <Navigate to="/" replace />;
    }

    // Role-based route protection
    if (location.pathname === "/authorization") {
        const canAccess = profile === "desenvolvedor" || profile === "coordenador" || user.email === "pedro.belarmino@escoteiros.org.br";
        if (!canAccess) {
            return <Navigate to="/home" replace />;
        }
    }

    return <Outlet />;
}
