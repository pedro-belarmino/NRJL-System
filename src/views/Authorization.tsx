import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ProfileRole } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Stack
} from "@mui/material";

export default function Authorization() {
    const { user, profile } = useAuth();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<ProfileRole>("facilitador");
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Business Logic:
    // - Desenvolvedor can create: coordenador, facilitador
    // - Coordenador can create: facilitador
    // - Facilitador can't create anything (but they shouldn't even be on this page)
    const isDeveloper = profile === "desenvolvedor" || user?.email === "pedro.belarmino@escoteiros.org.br";
    const isCoordinator = profile === "coordenador";

    const allowedRoles: ProfileRole[] = isDeveloper ? ["coordenador", "facilitador"] : isCoordinator ? ["facilitador"] : [];

    const handleAuthorize = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!email.endsWith("@escoteiros.org.br") && email !== "pedro.belarmino@escoteiros.org.br") {
            setStatus({ type: 'error', message: "O e-mail deve pertencer ao domínio @escoteiros.org.br" });
            return;
        }

        try {
            const userRef = doc(db, "allowed_users", email);
            await setDoc(userRef, {
                email,
                role,
                authorizedBy: user?.email,
                createdAt: new Date().toISOString()
            });

            setStatus({ type: 'success', message: `Usuário ${email} autorizado como ${role}!` });
            setEmail("");
        } catch (error) {
            console.error("Error authorizing user:", error);
            setStatus({ type: 'error', message: "Erro ao autorizar usuário. Verifique as permissões do Firestore." });
        }
    };

    if (!isDeveloper && !isCoordinator) {
        return <Typography variant="h6">Acesso negado.</Typography>;
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Autorização de Usuários
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Adicione e-mails @escoteiros.org.br à lista de usuários permitidos.
                </Typography>

                {status && (
                    <Alert severity={status.type} sx={{ mb: 2 }}>
                        {status.message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleAuthorize}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="E-mail do Usuário"
                            placeholder="exemplo@escoteiros.org.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel id="role-label">Perfil</InputLabel>
                            <Select
                                labelId="role-label"
                                value={role}
                                label="Perfil"
                                onChange={(e) => setRole(e.target.value as ProfileRole)}
                            >
                                {allowedRoles.map((r) => (
                                    <MenuItem key={r} value={r}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            color="warning"
                            fullWidth
                            size="large"
                            disabled={!email || allowedRoles.length === 0}
                        >
                            Autorizar Acesso
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}
