import { createContext } from "react";
import type { Project } from "./reducer";

export type ProjectsContextValue = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  updateProject: (id: number, updates: Partial<Omit<Project, "id">>) => Promise<void>;
};

export const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

