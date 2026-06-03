import { STORAGE_KEYS } from "../../config/constants";
import type { Action, LeaveRequest } from "./reducer";

type Dispatch = (action: Action) => void;

export const refreshLeaveRequests = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    const leaveRequests: LeaveRequest[] = stored
      ? JSON.parse(stored)
      : [];

    dispatch({ type: "API_CALL_END", payload: leaveRequests });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createLeaveRequest = async (opts: {
  data: {
    requesterId: number;
    requesterName: string;
    days: number;
    reason: string;
  };
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { data, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    const leaveRequests: LeaveRequest[] = stored
      ? JSON.parse(stored)
      : [];

    const newRequest: LeaveRequest = {
      id: Date.now(),
      requesterId: data.requesterId,
      requesterName: data.requesterName,
      days: data.days,
      reason: data.reason,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...leaveRequests, newRequest];
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(updated));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const updateLeaveRequestStatus = async (opts: {
  id: number;
  status: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, status, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    let leaveRequests: LeaveRequest[] = stored
      ? JSON.parse(stored)
      : [];

    const index = leaveRequests.findIndex((l) => l.id === id);
    if (index !== -1) {
      leaveRequests = [
        ...leaveRequests.slice(0, index),
        {
          ...leaveRequests[index],
          status: status as LeaveRequest["status"],
        },
        ...leaveRequests.slice(index + 1),
      ];
      localStorage.setItem(
        STORAGE_KEYS.LEAVE_REQUESTS,
        JSON.stringify(leaveRequests)
      );
    }

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const deleteLeaveRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    let leaveRequests: LeaveRequest[] = stored
      ? JSON.parse(stored)
      : [];

    leaveRequests = leaveRequests.filter((l) => l.id !== id);
    localStorage.setItem(
      STORAGE_KEYS.LEAVE_REQUESTS,
      JSON.stringify(leaveRequests)
    );

    dispatch({ type: "REMOVE_LEAVE_REQUEST_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};
