import type { Action, Project } from "./reducer";
import { STORAGE_KEYS } from "../../config/constants";

type Dispatch = (action: Action) => void;

export const refreshProjects = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = stored ? JSON.parse(stored) : [];

    dispatch({ type: "API_CALL_END", payload: projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createProjectRequest = async (opts: {
  name: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { name, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = stored ? JSON.parse(stored) : [];

    const newProject: Project = {
      id: Date.now(),
      name,
    };

    const updatedProjects = [...projects, newProject];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const updateProjectRequest = async (opts: {
  id: number;
  updates: Partial<Omit<Project, "id">>;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, updates, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = stored ? JSON.parse(stored) : [];

    const updatedProjects = projects.map((project) =>
      project.id === id ? { ...project, ...updates } : project
    );

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));

    dispatch({ type: "UPDATE_PROJECT_SUCCESS", payload: { id, updates } });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};


