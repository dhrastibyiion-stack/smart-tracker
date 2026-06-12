import { STORAGE_KEYS } from "../../config/constants";
import type { Action, Task } from "./reducer";
type Dispatch = (action: Action) => void;

export const refreshTasks = async (opts: {
  dispatch: Dispatch;
  companyId?: string | null;
  createdBy?: string | null;
}) => {
  const { dispatch, companyId, createdBy } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    tasks = tasks.filter((t) => !t.deletedAt);

    if (companyId) {
      tasks = tasks.filter((t) => t.companyId === companyId);
    }

    if (createdBy) {
      tasks = tasks.filter((t) => t.createdBy === createdBy || !t.createdBy);
    }

    dispatch({ type: "API_CALL_END", payload: { tasks, companyId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createTaskRequest = async (opts: {
  data: { title: string; projectId: string; projectName?: string; assignedTo?: number; createdAt?: number; description?: string; date?: string; dueDate?: string; assigneeName?: string; creatorId?: number; creatorName?: string; companyId?: string; createdBy?: string; status?: string };
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
      projectName: data.projectName,
      status: (data.status ?? "Pending") as Task["status"],
      assignedTo: data.assignedTo,
      createdAt: data.createdAt ?? Date.now(),
      description: data.description,
      date: data.date,
      dueDate: data.dueDate,
      assigneeName: data.assigneeName,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      createdBy: data.createdBy,
      comments: [],
      companyId: data.companyId,
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

    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks = [
        ...tasks.slice(0, index),
        { ...tasks[index], deletedAt: new Date().toISOString() },
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

export const restoreTaskRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks = [
        ...tasks.slice(0, index),
        { ...tasks[index], deletedAt: null },
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

export const updateTaskRequest = async (opts: {
  id: number;
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: number;
  date?: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, title, description, projectId, assignedTo, date, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks = [
        ...tasks.slice(0, index),
        { ...tasks[index], title, description, projectId, assignedTo, date },
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

export const updateTaskCommentsRequest = async (opts: {
  id: number;
  comments: string[];
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, comments, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    let tasks: Task[] = stored ? JSON.parse(stored) : [];

    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks = [
        ...tasks.slice(0, index),
        { ...tasks[index], comments },
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
