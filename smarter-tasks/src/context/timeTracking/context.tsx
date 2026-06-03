import { useCallback, useEffect, useMemo, useReducer } from "react";

import { TimeTrackingContext } from "./TimeTrackingContext";
import { reducer, type Action } from "./reducer";
import {
  addTimeLogRequest,
  deleteTimeLogRequest,
  refreshTimeLogs,
} from "./actions";

import type { TimeTrackingContextValue } from "./TimeTrackingContext";

type Dispatch = (action: Action) => void;

export const TimeTrackingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    timeLogs: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshTimeLogs({ dispatch });
  }, [dispatch]);

  const addTimeLog = useCallback(
    async (data: {
      taskId: number;
      userId: number;
      userName: string;
      hours: number;
      date: string;
      description: string;
    }) => {
      await addTimeLogRequest({
        data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
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
    }),
    [addTimeLog, deleteTimeLog, refresh, state.error, state.isLoading, state.timeLogs]
  );

  return <TimeTrackingContext.Provider value={value}>{children}</TimeTrackingContext.Provider>;
};