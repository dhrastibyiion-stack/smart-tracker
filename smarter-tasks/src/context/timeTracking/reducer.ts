import type { TimeLog } from "./TimeTrackingContext";

type State = {
  timeLogs: TimeLog[];
  companyId: string | null;
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: { timeLogs: TimeLog[]; companyId?: string | null } }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_TIMELOG_SUCCESS"; payload: number }
  | { type: "UPDATE_TIMELOG_SUCCESS"; payload: TimeLog };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "API_CALL_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "API_CALL_END": {
      const companyId = action.payload.companyId ?? state.companyId;
      const timeLogs = companyId
        ? action.payload.timeLogs.filter((t) => t.companyId === companyId)
        : action.payload.timeLogs;
      return {
        ...state,
        isLoading: false,
        timeLogs,
        companyId,
        error: null,
      };
    }
    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "REMOVE_TIMELOG_SUCCESS":
      return {
        ...state,
        isLoading: false,
        timeLogs: state.timeLogs.filter((t) => t.id !== action.payload),
        error: null,
      };
    case "UPDATE_TIMELOG_SUCCESS":
      return {
        ...state,
        isLoading: false,
        timeLogs: state.timeLogs.map((t) => (t.id === action.payload.id ? action.payload : t)),
        error: null,
      };
    default:
      return state;
  }
};

export type { TimeLog } from "./TimeTrackingContext";