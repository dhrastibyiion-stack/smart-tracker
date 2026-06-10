import type { Action, Project } from "./reducer";
import { STORAGE_KEYS } from "../../config/constants";

type Dispatch = (action: Action) => void;

export const refreshProjects = async (opts: {
  dispatch: Dispatch;
  companyId?: string | null;
  createdBy?: string | null;
}) => {
  const { dispatch, companyId } = opts;


  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    let projects: Project[] = stored ? JSON.parse(stored) : [];

    if (companyId) {
      projects = projects.filter((p) => p.companyId === companyId);
    }

    // Tenant isolation: when createdBy is provided, show only projects created by that admin.
    if (opts.createdBy) {
      projects = projects.filter((p) => p.createdBy === opts.createdBy || !p.createdBy);
    }

    dispatch({ type: "API_CALL_END", payload: { projects, companyId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createProjectRequest = async (opts: {
  name: string;
  description?: string;
  date?: string;
  time?: string;
  assignedTo?: number;
  companyId?: string;
  createdBy?: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { name, description, date, time, assignedTo, companyId, createdBy, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = stored ? JSON.parse(stored) : [];

    const newProject: Project = {
      id: Date.now(),
      name,
      description,
      date,
      time,
      assignedTo,
      companyId,
      createdBy,
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

export const deleteProjectRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = stored ? JSON.parse(stored) : [];

    const updatedProjects = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));

    dispatch({ type: "DELETE_PROJECT_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

