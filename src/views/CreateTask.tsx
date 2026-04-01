import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createTask, listAllAuthorizedUsers } from "../service/taskService";
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

export default function CreateTask() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [deadline, setDeadline] = useState("");
    const [authorizedUsers, setAuthorizedUsers] = useState<{ email: string; role: string }[]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await listAllAuthorizedUsers();
            setAuthorizedUsers(users);
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!user?.email) return;

        try {
            await createTask({
                title,
                description,
                assignedTo,
                deadline,
                createdBy: user.email
            });

            setStatus({ type: 'success', message: `Tarefa "${title}" criada com sucesso!` });
            setTitle("");
            setDescription("");
            setAssignedTo("");
            setDeadline("");
        } catch (error) {
            console.error("Error creating task:", error);
            setStatus({ type: 'error', message: "Erro ao criar tarefa. Verifique as permissões." });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                    Criar Nova Tarefa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Atribua uma nova tarefa a um facilitador.
                </Typography>

                {status && (
                    <Alert severity={status.type} sx={{ mb: 2 }}>
                        {status.message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Título da Tarefa"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Descrição"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel id="assign-label">Atribuir a</InputLabel>
                            <Select
                                labelId="assign-label"
                                value={assignedTo}
                                label="Atribuir a"
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                {authorizedUsers.map((u) => (
                                    <MenuItem key={u.email} value={u.email}>
                                        {u.email} ({u.role})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Prazo Final"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            disabled={!title || !assignedTo || !deadline}
                        >
                            Criar Tarefa
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
}
