export type TaskStatus =
  | "atribuído"
  | "realizando"
  | "aguardando revisão"
  | "aguardando correção"
  | "finalizado";

export interface Task {
    id?: string;
    title: string;
    description: string;
    status: TaskStatus;
    assignedTo: string; // User email
    deadline: string; // ISO date string
    createdBy: string; // User email
    createdAt: string; // ISO date string
}
