import type { TimeLog } from "./TimeTrackingContext";

type State = {
  timeLogs: TimeLog[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: TimeLog[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_TIMELOG_SUCCESS"; payload: number };

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
        timeLogs: action.payload,
        error: null,
      };
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
    default:
      return state;
  }
};

export type { TimeLog } from "./TimeTrackingContext";