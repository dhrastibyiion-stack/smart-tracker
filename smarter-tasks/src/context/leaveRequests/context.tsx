import { useCallback, useEffect, useMemo, useReducer } from "react";

import { LeaveRequestsContext } from "./LeaveRequestsContext";
import { reducer, type Action } from "./reducer";
import {
  createLeaveRequest,
  deleteLeaveRequest,
  refreshLeaveRequests,
  updateLeaveRequest,
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

  const refresh = useCallback(async (companyId?: string | null) => {
    await refreshLeaveRequests({ dispatch, companyId });
  }, [dispatch]);

  const create = useCallback(
    async (data: {
      requesterId: number;
      requesterName: string;
      days: number;
      reason: string;
      startDate: string;
      endDate: string;
      companyId?: string;
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

  const update = useCallback(
    async (id: number, data: { days: number; reason: string; startDate: string; endDate: string }) => {
      await updateLeaveRequest({
        id,
        data,
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
      updateLeaveRequest: update,
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
      update,
      updateStatus,
    ]
  );

  return (
    <LeaveRequestsContext.Provider value={value}>
      {children}
    </LeaveRequestsContext.Provider>
  );
};
