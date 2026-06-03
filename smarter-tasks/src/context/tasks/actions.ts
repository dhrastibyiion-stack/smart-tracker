import { STORAGE_KEYS } from "../../config/constants";
import type { Action, Task } from "./reducer";
type Dispatch = (action: Action) => void;

export const refreshTasks = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = stored ? JSON.parse(stored) : [];

    dispatch({ type: "API_CALL_END", payload: tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createTaskRequest = async (opts: {
  data: { title: string; projectId: string; assignedTo?: number; createdAt?: number };
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { data, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = stored ? JSON.parse(stored) : [];

    const newTask: Task = {
      id: Date.now(),
      title: data.title,
      projectId: data.projectId,
      status: "Pending",
      assignedTo: data.assignedTo,
      createdAt: data.createdAt ?? Date.now(),
    };

    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const updateTaskStatusRequest = async (opts: {
  id: number;
  status: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, status, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks = [
        ...tasks.slice(0, index),
        { ...tasks[index], status: status as Task["status"] },
        ...tasks.slice(index + 1),
      ];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const deleteTaskRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    tasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    dispatch({ type: "REMOVE_TASK_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};
