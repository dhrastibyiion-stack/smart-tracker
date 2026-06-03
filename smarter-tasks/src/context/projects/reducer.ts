export type Project = {
  id: number;
  name: string;
};

type State = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: Project[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "UPDATE_PROJECT_SUCCESS"; payload: { id: number; updates: Partial<Omit<Project, "id">> } };

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
        projects: action.payload,
        error: null,
      };

    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "UPDATE_PROJECT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates }
            : project
        ),
        error: null,
      };

    default:
      return state;
  }
};


