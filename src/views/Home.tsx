import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Home() {
    const { role, user } = useAuth();

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, textAlign: "center", boxShadow: 6 }}>
                <Typography variant="h3" gutterBottom>
                    Página Home
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                    Bem-vindo, {user?.displayName || user?.email}! ⚜️
                </Typography>

                {(role === "developer" || role === "coordinator") && (
                    <Box mt={4}>
                        <Button
                            component={Link}
                            to="/admin"
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            color="info"
                        >
                            Administrar Permissões
                        </Button>
                    </Box>
                )}

                <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                        Perfil atual: <b style={{textTransform: 'capitalize'}}>{role || 'não autorizado'}</b>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
