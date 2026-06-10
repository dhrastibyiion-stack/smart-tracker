import { createContext } from "react";
import type { Project } from "./reducer";

export type ProjectsContextValue = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (project: { name: string; description?: string; date?: string; time?: string; assignedTo?: number; companyId?: string }) => Promise<void>;
  updateProject: (id: number, updates: Partial<Omit<Project, "id">>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
};

export const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

