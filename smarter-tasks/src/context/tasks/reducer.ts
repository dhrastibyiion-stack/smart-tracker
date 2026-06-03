import type { Task } from "./TasksContext";

type State = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: Task[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_TASK_SUCCESS"; payload: number };

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
        tasks: action.payload,
        error: null,
      };
    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "REMOVE_TASK_SUCCESS":
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        error: null,
      };
    default:
      return state;
  }
};

export type { Task } from "./TasksContext";
