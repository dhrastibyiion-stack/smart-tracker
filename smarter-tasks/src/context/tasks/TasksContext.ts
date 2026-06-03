import { createContext } from "react";
import type { TaskStatus } from "../../config/constants";

export type Task = {
  id: number;
  title: string;
  projectId: string;
  status: TaskStatus;
  assignedTo?: number;
  createdAt: number; // Timestamp when task was created
};

export type TasksContextValue = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (data: { title: string; projectId: string; assignedTo?: number; createdAt?: number }) => Promise<void>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
};

export const TasksContext = createContext<TasksContextValue | undefined>(undefined);
