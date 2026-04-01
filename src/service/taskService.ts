import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Task, TaskStatus } from "../types/Task";

const tasksCollection = collection(db, "tasks");

export const createTask = async (task: Omit<Task, "id" | "status" | "createdAt">) => {
    try {
        const newTask: Omit<Task, "id"> = {
            ...task,
            status: "atribuído",
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(tasksCollection, newTask);
        return { id: docRef.id, ...newTask };
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void, filters?: { assignedTo?: string }) => {
    let q = query(tasksCollection, orderBy("deadline", "asc"));

    if (filters?.assignedTo) {
        q = query(tasksCollection, where("assignedTo", "==", filters.assignedTo), orderBy("deadline", "asc"));
    }

    return onSnapshot(q, (snapshot) => {
        const tasks: Task[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Task));
        callback(tasks);
    });
};

export const listAllAuthorizedUsers = async () => {
    try {
        const usersSnap = await getDocs(collection(db, "allowed_users"));
        return usersSnap.docs.map(doc => doc.data() as { email: string; role: string });
    } catch (error) {
        console.error("Error listing users:", error);
        return [];
    }
};
