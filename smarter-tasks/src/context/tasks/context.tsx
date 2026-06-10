import { useAuth } from "../../context/auth";
import { STORAGE_KEYS } from "../../config/constants";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { TasksContext } from "./TasksContext";
import { reducer, type Action, type Task } from "./reducer";
import {
  createTaskRequest,
  deleteTaskRequest,
  refreshTasks,
  updateTaskStatusRequest,
  updateTaskRequest,
  restoreTaskRequest,
  updateTaskCommentsRequest,
} from "./actions";

import type { TasksContextValue } from "./TasksContext";

type Dispatch = (action: Action) => void;

export const TasksProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [state, dispatchBase] = useReducer(reducer, {
    tasks: [],
    companyId: null,
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshTasks({ dispatch, companyId: user?.companyId ?? null });
  }, [dispatch, user?.companyId]);

  const createTask = useCallback(
    async (data: { title: string; projectId: string; assignedTo?: number; description?: string; date?: string; creatorId?: number; creatorName?: string; companyId?: string }) => {
      await createTaskRequest({
        data: { ...data, companyId: data.companyId ?? user?.companyId },
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh, user?.companyId]
  );

  const updateTaskStatus = useCallback(
    async (id: number, status: string) => {
      await updateTaskStatusRequest({
        id,
        status,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

const deleteTask = useCallback(
    async (id: number) => {
      await deleteTaskRequest({
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const restoreTask = useCallback(
    async (id: number) => {
      await restoreTaskRequest({
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const getDeletedTasks = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = stored ? JSON.parse(stored) : [];
    return tasks.filter((t) => t.deletedAt);
  }, []);

  const updateTask = useCallback(
    async (id: number, data: { title: string; description?: string; projectId: string; assignedTo?: number; date?: string }) => {
      await updateTaskRequest({
        ...data,
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const updateTaskComments = useCallback(
    async (id: number, comments: string[]) => {
      await updateTaskCommentsRequest({
        id,
        comments,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: state.tasks,
      isLoading: state.isLoading,
      error: state.error,
      refreshTasks: refresh,
      createTask,
      updateTaskStatus,
      updateTask,
      updateTaskComments,
      deleteTask,
      restoreTask,
      getDeletedTasks,
    }),
    [createTask, deleteTask, getDeletedTasks, refresh, restoreTask, state.error, state.isLoading, state.tasks, updateTaskStatus, updateTaskComments]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
