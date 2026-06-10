import { createContext } from "react";
import type { TaskStatus } from "../../config/constants";

export type Task = {
  id: number;
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  assignedTo?: number;
  date?: string;
  createdAt: number;
  dueDate?: string;
  completedAtDate?: string;
  assigneeName?: string;
  creatorId?: number;
  creatorName?: string;
  createdBy?: string;
  deletedAt?: string | null;
  comments?: string[];
  companyId?: string;
};

export type TasksContextValue = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (data: { title: string; projectId: string; assignedTo?: number; createdAt?: number; description?: string; date?: string; companyId?: string; createdBy?: string }) => Promise<void>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  updateTask: (id: number, data: { title: string; description?: string; projectId: string; assignedTo?: number; date?: string }) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  restoreTask: (id: number) => Promise<void>;
  getDeletedTasks: () => Task[];
  updateTaskComments: (id: number, comments: string[]) => Promise<void>;
};

export const TasksContext = createContext<TasksContextValue | undefined>(undefined);
