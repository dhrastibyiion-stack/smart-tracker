import { useCallback, useEffect, useMemo, useReducer } from "react";

import { LeaveRequestsContext } from "./LeaveRequestsContext";
import { reducer, type Action } from "./reducer";
import {
  createLeaveRequest,
  deleteLeaveRequest,
  refreshLeaveRequests,
  updateLeaveRequestStatus,
} from "./actions";

import type { LeaveRequestsContextValue } from "./LeaveRequestsContext";

type Dispatch = (action: Action) => void;

export type { LeaveRequest } from "./LeaveRequestsContext";

export const LeaveRequestsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    leaveRequests: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshLeaveRequests({ dispatch });
  }, [dispatch]);

  const create = useCallback(
    async (data: {
      requesterId: number;
      requesterName: string;
      days: number;
      reason: string;
    }) => {
      await createLeaveRequest({
        data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const updateStatus = useCallback(
    async (id: number, status: string) => {
      await updateLeaveRequestStatus({
        id,
        status,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const deleteLeave = useCallback(
    async (id: number) => {
      await deleteLeaveRequest({
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

  const value = useMemo<LeaveRequestsContextValue>(
    () => ({
      leaveRequests: state.leaveRequests,
      isLoading: state.isLoading,
      error: state.error,
      refreshLeaveRequests: refresh,
      createLeaveRequest: create,
      updateLeaveRequestStatus: updateStatus,
      deleteLeaveRequest: deleteLeave,
    }),
    [
      create,
      deleteLeave,
      refresh,
      state.error,
      state.isLoading,
      state.leaveRequests,
      updateStatus,
    ]
  );

  return (
    <LeaveRequestsContext.Provider value={value}>
      {children}
    </LeaveRequestsContext.Provider>
  );
};
