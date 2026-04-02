import { useAuth } from "../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../firebase/config";
import GoogleIcon from '@mui/icons-material/Google';
import {
    Box, Button, Typography,
    Avatar,
    Card, CardContent, CardActions,
    CircularProgress,
    Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { version } from '../../versioning'

function App() {

    const navigate = useNavigate()
    const { user, loading, error, isAuthorized } = useAuth();

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setPersistence(auth, browserLocalPersistence);
        await signInWithPopup(auth, provider);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress color="primary" />
        </Box>
    );

    return (
        <Card
            sx={{
                maxWidth: 400,
                mx: "auto",
                mt: 4,
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                textAlign: "center",
            }}
        >
            <Typography variant="h6" fontWeight="bold" sx={{ p: 2 }}>GERENCIADOR DA REDE REGIONAL DE JOVENS LIDERES</Typography>
            <img
                src="/Site RNJL-SP (12).png"
                alt="Logo"
                style={{ width: 150, maxWidth: "100%" }}
            />

            <CardContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {user && isAuthorized ? (
                    <>
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ gap: 2 }}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ mt: 1 }}
                                >
                                    Bem-vindo, {user.displayName}
                                </Typography>
                            </Box>

                            <Avatar
                                src={user.photoURL || ""}
                                alt={user.displayName || ''}
                                sx={{ width: 56, height: 56 }}
                            />
                        </Box>
                    </>
                ) : (
                    <Typography
                        variant="h6"
                        sx={{ mb: 2 }}
                    >
                        Acesse sua conta
                    </Typography>
                )}
            </CardContent>

            <CardActions
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    justifyContent: "center",
                }}
            >
                {user && isAuthorized ? (
                    <>
                        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/home')}>
                            Entrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            fullWidth
                        >
                            Sair da conta
                        </Button>
                    </>
                ) : (
                    <div>
                        <Button
                            variant="contained"
                            onClick={handleLogin}
                            startIcon={<GoogleIcon />}
                            fullWidth
                        >
                            Login com Google (*Somente)
                        </Button>
                        <br />
                        <br />
                        <Typography fontSize={"small"}>
                            (*) É necessário ter uma conta de e-mail do Google com o domínio <b>@escoteiros.org.br</b>. Muagra 🙌🏻
                        </Typography>
                    </div>
                )}
            </CardActions>
            <p style={{ fontSize: 'small', }}>{version}</p>
        </Card>
    );
}

export default App;
