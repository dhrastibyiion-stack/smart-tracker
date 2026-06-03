import { useContext } from "react";

import type { TasksContextValue } from "./TasksContext";
import { TasksContext } from "./TasksContext";

export const useTasks = (): TasksContextValue => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};
