import { createContext } from "react";
import type { RequestStatus } from "../../config/constants";

export type LeaveRequest = {
  id: number;
  requesterId: number;
  requesterName: string;
  days: number;
  reason: string;
  status: RequestStatus;
  createdAt: string;
};

export type LeaveRequestsContextValue = {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
  refreshLeaveRequests: () => Promise<void>;
  createLeaveRequest: (data: {
    requesterId: number;
    requesterName: string;
    days: number;
    reason: string;
  }) => Promise<void>;
  updateLeaveRequestStatus: (id: number, status: RequestStatus) => Promise<void>;
  deleteLeaveRequest: (id: number) => Promise<void>;
};

export const LeaveRequestsContext =
  createContext<LeaveRequestsContextValue | undefined>(undefined);
