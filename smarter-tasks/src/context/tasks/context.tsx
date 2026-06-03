import { useCallback, useEffect, useMemo, useReducer } from "react";

import { TasksContext } from "./TasksContext";
import { reducer, type Action } from "./reducer";
import {
  createTaskRequest,
  deleteTaskRequest,
  refreshTasks,
  updateTaskStatusRequest,
} from "./actions";

import type { TasksContextValue } from "./TasksContext";

type Dispatch = (action: Action) => void;

export const TasksProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    tasks: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshTasks({ dispatch });
  }, [dispatch]);

  const createTask = useCallback(
    async (data: { title: string; projectId: string; assignedTo?: number }) => {
      await createTaskRequest({
        data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
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
      deleteTask,
    }),
    [createTask, deleteTask, refresh, state.error, state.isLoading, state.tasks, updateTaskStatus]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
