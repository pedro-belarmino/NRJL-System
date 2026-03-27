import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToTasks, updateTaskStatus, listAllAuthorizedUsers } from "../service/taskService";
import type { Task, TaskStatus } from "../types/Task";
import {
    Box,
    Typography,
    Container,
    Paper,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Divider
} from "@mui/material";

export default function Home() {
    const { user, profile } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [authorizedUsers, setAuthorizedUsers] = useState<{ email: string; role: string }[]>([]);
    const [filterUser, setFilterUser] = useState<string>("all");

    const isSuperUser = user?.email === "pedro.belarmino@escoteiros.org.br";
    const isAdmin = profile === "desenvolvedor" || profile === "coordenador" || isSuperUser;
    const isFacilitator = profile === "facilitador" && !isSuperUser;

    useEffect(() => {
        const unsubscribe = subscribeToTasks((newTasks) => {
            setTasks(newTasks);
        });

        if (isAdmin) {
            listAllAuthorizedUsers().then(setAuthorizedUsers);
        }

        return () => unsubscribe();
    }, [isAdmin]);

    const filteredTasks = useMemo(() => {
        if (isFacilitator) {
            return tasks.filter(t => t.assignedTo === user?.email);
        }
        if (filterUser !== "all") {
            return tasks.filter(t => t.assignedTo === filterUser);
        }
        return tasks;
    }, [tasks, isFacilitator, user?.email, filterUser]);

    const handleStatusChange = async (taskId: string, currentStatus: TaskStatus, newStatus: TaskStatus) => {
        // Business logic for status changes:
        // - Facilitators can only move to "realizando" or "aguardando revisão"
        // - Coordinators/Devs can move to anything except back to "atribuído" once it started "realizando"

        if (isFacilitator) {
            if (newStatus !== "realizando" && newStatus !== "aguardando revisão") {
                return;
            }
        }

        if (isAdmin) {
            if (currentStatus !== "atribuído" && newStatus === "atribuído") {
                return;
            }
        }

        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "atribuído": return "default";
            case "realizando": return "primary";
            case "aguardando revisão": return "warning";
            case "aguardando correção": return "error";
            case "finalizado": return "success";
            default: return "default";
        }
    };

    const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
        const allStatuses: TaskStatus[] = ["atribuído", "realizando", "aguardando revisão", "aguardando correção", "finalizado"];

        if (isFacilitator) {
            return ["realizando", "aguardando revisão"].filter(s => s !== currentStatus) as TaskStatus[];
        }

        if (isAdmin) {
            // Cannot go back to "atribuído" if already started
            if (currentStatus !== "atribuído") {
                return allStatuses.filter(s => s !== currentStatus && s !== "atribuído");
            }
            return allStatuses.filter(s => s !== currentStatus);
        }

        return [];
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Tarefas de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </Typography>

                {isAdmin && (
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="filter-user-label">Responsável</InputLabel>
                        <Select
                            labelId="filter-user-label"
                            value={filterUser}
                            label="Responsável"
                            onChange={(e) => setFilterUser(e.target.value)}
                        >
                            <MenuItem value="all">Todos</MenuItem>
                            {authorizedUsers.map(u => (
                                <MenuItem key={u.email} value={u.email}>{u.email}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Stack>

            {filteredTasks.length === 0 ? (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="text.secondary">Nenhuma tarefa encontrada.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {filteredTasks.map((task) => (
                        <Paper key={task.id} elevation={2} sx={{ p: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{task.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={task.status.toUpperCase()}
                                    color={getStatusColor(task.status)}
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2 }}>{task.description}</Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Atribuído a: <b>{task.assignedTo}</b>
                                </Typography>

                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel id={`status-select-label-${task.id}`}>Alterar Status</InputLabel>
                                    <Select
                                        labelId={`status-select-label-${task.id}`}
                                        value=""
                                        label="Alterar Status"
                                        onChange={(e) => handleStatusChange(task.id!, task.status, e.target.value as TaskStatus)}
                                    >
                                        {getAvailableStatuses(task.status).map((s) => (
                                            <MenuItem key={s} value={s}>{s}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}
