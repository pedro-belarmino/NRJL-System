import { Box, Typography, Container, Paper } from "@mui/material";

export default function Home() {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="warning.main">
                        Bem-vindo à Home
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Este é o ponto de partida do seu novo projeto simplificado.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    )
}
