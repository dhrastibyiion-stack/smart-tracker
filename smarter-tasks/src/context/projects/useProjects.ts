import { useContext } from "react";

import type { ProjectsContextValue } from "./ProjectsContext";
import { ProjectsContext } from "./ProjectsContext";

export const useProjects = (): ProjectsContextValue => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
};

