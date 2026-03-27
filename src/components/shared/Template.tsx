import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { Box } from "@mui/material";

export default function Template() {
    return (
        <Box sx={{ pb: 7 }}> {/* Add padding bottom to account for the fixed NavBar */}
            <Box component="main">
                <Outlet />
            </Box>
            <NavBar />
        </Box>
    )
}
