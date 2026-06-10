import { createContext } from "react";

export type TimeLog = {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  hours: number;
  date: string;
  description: string;
  taskTitle?: string;
  event?: "login" | "logout" | "task_started" | "task_completed";
  companyId?: string;
};

export type TimeTrackingContextValue = {
  timeLogs: TimeLog[];
  isLoading: boolean;
  error: string | null;
  refreshTimeLogs: () => Promise<void>;
  addTimeLog: (data: {
    taskId: number;
    userId: number;
    userName: string;
    hours: number;
    date: string;
    description: string;
    companyId?: string;
  }) => Promise<void>;
  deleteTimeLog: (id: number) => Promise<void>;
  updateTimeLog: (data: TimeLog) => Promise<void>;
  recordActivity: (data: {
    userId: number;
    userName: string;
    taskId?: number;
    taskTitle?: string;
    event: TimeLog["event"];
  }) => Promise<void>;
};

export const TimeTrackingContext = createContext<TimeTrackingContextValue | undefined>(undefined);