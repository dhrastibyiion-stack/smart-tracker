import { createContext } from "react";

export type TimeLog = {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  hours: number;
  date: string; // ISO date string
  description: string;
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
  }) => Promise<void>;
  deleteTimeLog: (id: number) => Promise<void>;
};

export const TimeTrackingContext = createContext<TimeTrackingContextValue | undefined>(undefined);