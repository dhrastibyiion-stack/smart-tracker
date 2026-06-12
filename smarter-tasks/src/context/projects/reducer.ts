export type Project = {
  id: number;
  name: string;
  description?: string;
  assignedTo?: number;
  date?: string;
  time?: string;
  companyId?: string;
  createdBy?: string;
};

type State = {
  projects: Project[];
  companyId: string | null;
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: { projects: Project[] | null | undefined; companyId?: string | null } }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "UPDATE_PROJECT_SUCCESS"; payload: { id: number; updates: Partial<Omit<Project, "id">> } }
  | { type: "DELETE_PROJECT_SUCCESS"; payload: number };

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
      const raw = Array.isArray(action.payload.projects)
        ? action.payload.projects
        : [];
      const projects = companyId
        ? raw.filter((p) => p.companyId === companyId)
        : raw;
      return {
        ...state,
        isLoading: false,
        projects,
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

    case "DELETE_PROJECT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        projects: state.projects.filter((p) => p.id !== action.payload),
        error: null,
      };

    default:
      return state;
  }
};


