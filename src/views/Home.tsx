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
    Divider,
    Badge
} from "@mui/material";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';

function ServerDay(props: PickersDayProps & { highlightedDays?: number[] }) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected =
        !outsideCurrentMonth && highlightedDays.indexOf((day as Dayjs).date()) >= 0;

    return (
        <Badge
            key={(day as Dayjs).toString()}
            overlap="circular"
            badgeContent={isSelected ? '●' : undefined}
            color="error"
        >
            <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

export default function Home() {
    const { user, profile } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [authorizedUsers, setAuthorizedUsers] = useState<{ email: string; role: string }[]>([]);
    const [filterUser, setFilterUser] = useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

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
        let result = tasks;
        if (isFacilitator) {
            result = tasks.filter(t => t.assignedTo === user?.email);
        } else if (filterUser !== "all") {
            result = tasks.filter(t => t.assignedTo === filterUser);
        }
        return result;
    }, [tasks, isFacilitator, user?.email, filterUser]);

    const tasksForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return filteredTasks.filter(t => dayjs(t.deadline).isSame(selectedDate, 'day'));
    }, [filteredTasks, selectedDate]);

    const highlightedDays = useMemo(() => {
        // Find tasks in the current month of the selected view date
        const currentMonthTasks = filteredTasks.filter(t =>
            t.status !== "finalizado" &&
            dayjs(t.deadline).isSame(selectedDate || dayjs(), 'month')
        );
        return Array.from(new Set(currentMonthTasks.map(t => dayjs(t.deadline).date())));
    }, [filteredTasks, selectedDate]);

    const handleStatusChange = async (taskId: string, currentStatus: TaskStatus, newStatus: TaskStatus) => {
        if (isFacilitator) {
            if (newStatus !== "realizando" && newStatus !== "aguardando revisão") return;
        }
        if (isAdmin) {
            if (currentStatus !== "atribuído" && newStatus === "atribuído") return;
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
            case "aguardando revisão": return "secondary";
            case "aguardando correção": return "error";
            case "finalizado": return "success";
            default: return "default";
        }
    };

    const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
        const allStatuses: TaskStatus[] = ["atribuído", "realizando", "aguardando revisão", "aguardando correção", "finalizado"];
        if (isFacilitator) return ["realizando", "aguardando revisão"].filter(s => s !== currentStatus) as TaskStatus[];
        if (isAdmin) {
            if (currentStatus !== "atribuído") return allStatuses.filter(s => s !== currentStatus && s !== "atribuído");
            return allStatuses.filter(s => s !== currentStatus);
        }
        return [];
    };

    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Calendário de Tarefas
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

            <Paper elevation={3} sx={{ borderRadius: 3, mb: 3, p: { xs: 0, sm: 2 } }}>
                <DateCalendar
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slots={{ day: ServerDay }}
                    slotProps={{
                        day: { highlightedDays } as any,
                    }}
                    sx={{ width: '100%', maxWidth: '100%', height: 'auto' }}
                />
            </Paper>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderLeft: 4, borderColor: 'primary.main', pl: 1 }}>
                Tarefas para {selectedDate?.format('DD/MM/YYYY')}
            </Typography>

            {tasksForSelectedDate.length === 0 ? (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', opacity: 0.8 }}>
                    <Typography color="text.secondary">Nenhuma tarefa pendente para este dia.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {tasksForSelectedDate.map((task) => (
                        <Paper key={task.id} elevation={2} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">{task.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Responsável: <b>{task.assignedTo}</b>
                                    </Typography>
                                </Box>
                                <Chip
                                    label={task.status.toUpperCase()}
                                    color={getStatusColor(task.status)}
                                    size="small"
                                    sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{task.description}</Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
