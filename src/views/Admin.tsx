import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Container, Typography, Box, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Select, MenuItem, IconButton, Alert, CircularProgress, Card, CardContent
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
    getAllowedUsers, addAllowedUser, removeAllowedUser,
    type UserRole, type AllowedUser, isEmailAuthorized
} from "../service/authoriseEmailService";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<UserRole>("facilitator");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const users = await getAllowedUsers();
            setAllowedUsers(users);
        } catch (err) {
            setError("Erro ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!role || role === 'facilitator') {
            navigate('/home');
        } else {
            fetchUsers();
        }
    }, [role, navigate, fetchUsers]);

    const handleAddUser = async () => {
        setError(null);
        setSuccess(null);

        if (!newEmail) {
            setError("O e-mail é obrigatório.");
            return;
        }

        // Domain check as per memory
        const isAuthorizedDomain = await isEmailAuthorized(newEmail);
        if (!isAuthorizedDomain && !newEmail.includes('@escoteiros')) {
             setError("O e-mail deve pertencer ao domínio @escoteiros.");
             return;
        }

        if (role === "coordinator" && newRole !== "facilitator") {
            setError("Coordenadores só podem criar perfis de facilitadores.");
            return;
        }

        try {
            await addAllowedUser(newEmail, newRole);
            setSuccess(`Usuário ${newEmail} adicionado com sucesso!`);
            setNewEmail("");
            setNewRole("facilitator");
            fetchUsers();
        } catch (err) {
            setError("Erro ao adicionar usuário.");
        }
    };

    const handleRemoveUser = async (email: string) => {
        if (email === user?.email) {
            setError("Você não pode remover seu próprio acesso.");
            return;
        }

        try {
            await removeAllowedUser(email);
            setSuccess(`Usuário ${email} removido.`);
            fetchUsers();
        } catch (err) {
            setError("Erro ao remover usuário.");
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Administração de Permissões
            </Typography>

            <Card sx={{ mb: 4, p: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Adicionar Novo Usuário
                    </Typography>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                        <TextField
                            fullWidth
                            label="E-mail (@escoteiros)"
                            variant="outlined"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="facilitator">Facilitador</MenuItem>
                            {role === "developer" && (
                                <>
                                    <MenuItem value="coordinator">Coordenador</MenuItem>
                                    <MenuItem value="developer">Desenvolvedor</MenuItem>
                                </>
                            )}
                        </Select>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PersonAddIcon />}
                            onClick={handleAddUser}
                            sx={{ height: 56 }}
                        >
                            Adicionar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                        <TableRow>
                            <TableCell><b>E-mail</b></TableCell>
                            <TableCell><b>Perfil</b></TableCell>
                            <TableCell align="right"><b>Ações</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allowedUsers.map((u) => (
                            <TableRow key={u.email}>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                        {u.role}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveUser(u.email)}
                                        disabled={u.email === user?.email || (role === 'coordinator' && u.role !== 'facilitator')}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box mt={4}>
                <Button variant="outlined" onClick={() => navigate('/home')}>
                    Voltar para Home
                </Button>
            </Box>
        </Container>
    );
}
