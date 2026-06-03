import type { LeaveRequest } from "./LeaveRequestsContext";

type State = {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: LeaveRequest[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_LEAVE_REQUEST_SUCCESS"; payload: number };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "API_CALL_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "API_CALL_END":
      return {
        ...state,
        isLoading: false,
        leaveRequests: action.payload,
        error: null,
      };
    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "REMOVE_LEAVE_REQUEST_SUCCESS":
      return {
        ...state,
        isLoading: false,
        leaveRequests: state.leaveRequests.filter(
          (l) => l.id !== action.payload
        ),
        error: null,
      };
    default:
      return state;
  }
};

export type { LeaveRequest } from "./LeaveRequestsContext";
