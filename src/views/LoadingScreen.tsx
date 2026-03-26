import { Box, CircularProgress } from "@mui/material";

export default function LoadingScreen() {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                zIndex: (theme) => theme.zIndex.modal + 1
            }}
        >
            <CircularProgress color="secondary" size="3rem" />
        </Box>
    );
}