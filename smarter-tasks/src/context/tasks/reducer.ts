import type { Task } from "./TasksContext";

type State = {
  tasks: Task[];
  companyId: string | null;
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: { tasks: Task[]; companyId?: string | null } }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_TASK_SUCCESS"; payload: number }
  | { type: "UPDATE_TASK_SUCCESS"; payload: Task }
  | { type: "UPDATE_TASK_COMMENTS_SUCCESS"; payload: Task };

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
      const tasks = companyId
        ? action.payload.tasks.filter((t) => t.companyId === companyId)
        : action.payload.tasks;
      return {
        ...state,
        isLoading: false,
        tasks,
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
    case "REMOVE_TASK_SUCCESS":
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        error: null,
      };
    case "UPDATE_TASK_SUCCESS":
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.map((t) => t.id === action.payload.id ? action.payload : t),
        error: null,
      };
    case "UPDATE_TASK_COMMENTS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        tasks: state.tasks.map((t) => t.id === action.payload.id ? action.payload : t),
        error: null,
      };
    default:
      return state;
  }
};

export type { Task } from "./TasksContext";
