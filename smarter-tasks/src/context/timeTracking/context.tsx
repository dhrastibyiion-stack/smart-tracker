import { useAuth } from "../../context/auth";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { TimeTrackingContext } from "./TimeTrackingContext";
import { reducer, type Action } from "./reducer";
import {
  addTimeLogRequest,
  deleteTimeLogRequest,
  recordActivityRequest,
  refreshTimeLogs,
  updateTimeLogRequest,
} from "./actions";

import type { TimeTrackingContextValue } from "./TimeTrackingContext";

type Dispatch = (action: Action) => void;

export const TimeTrackingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  const [state, dispatchBase] = useReducer(reducer, {
    timeLogs: [],
    companyId: null,
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshTimeLogs({ dispatch, companyId: user?.companyId ?? null });
  }, [dispatch, user?.companyId]);

  const addTimeLog = useCallback(
    async (data: {
      taskId: number;
      userId: number;
      userName: string;
      hours: number;
      date: string;
      description: string;
      companyId?: string;
    }) => {
      await addTimeLogRequest({
        data: { ...data, companyId: data.companyId ?? user?.companyId },
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh, user?.companyId]
  );

  const deleteTimeLog = useCallback(
    async (id: number) => {
      await deleteTimeLogRequest({
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const updateTimeLog = useCallback(
    async (data: TimeLog) => {
      await updateTimeLogRequest({
        data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const recordActivity = useCallback(
    async (data: {
      userId: number;
      userName: string;
      taskId?: number;
      taskTitle?: string;
      event: "login" | "logout" | "task_started" | "task_completed";
      companyId?: string;
    }) => {
      await recordActivityRequest({
        data: { ...data, companyId: data.companyId ?? user?.companyId },
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh, user?.companyId]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<TimeTrackingContextValue>(
    () => ({
      timeLogs: state.timeLogs,
      isLoading: state.isLoading,
      error: state.error,
      refreshTimeLogs: refresh,
      addTimeLog,
      deleteTimeLog,
      updateTimeLog,
      recordActivity,
    }),
    [addTimeLog, deleteTimeLog, updateTimeLog, recordActivity, refresh, state.error, state.isLoading, state.timeLogs]
  );

  return <TimeTrackingContext.Provider value={value}>{children}</TimeTrackingContext.Provider>;
};