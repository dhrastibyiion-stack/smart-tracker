import { useContext } from "react";

import type { LeaveRequestsContextValue } from "./LeaveRequestsContext";
import { LeaveRequestsContext } from "./LeaveRequestsContext";

export const useLeaveRequests = (): LeaveRequestsContextValue => {
  const ctx = useContext(LeaveRequestsContext);
  if (!ctx)
    throw new Error(
      "useLeaveRequests must be used within LeaveRequestsProvider"
    );
  return ctx;
};
