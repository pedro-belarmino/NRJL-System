import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function PrivateWrapper() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress color="warning" />
            </Box>
        );
    }


    if (!user && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
