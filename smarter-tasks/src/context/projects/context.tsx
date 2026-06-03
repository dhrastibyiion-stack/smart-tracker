import { useCallback, useEffect, useMemo, useReducer } from "react";

import { ProjectsContext } from "./ProjectsContext";
import type { Project } from "./reducer";
import { reducer, type Action } from "./reducer";
import { createProjectRequest, refreshProjects, updateProjectRequest } from "./actions";

import type { ProjectsContextValue } from "./ProjectsContext";

type Dispatch = (action: Action) => void;

export const ProjectsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    projects: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshProjects({ dispatch });
  }, [dispatch]);

  const createProject = useCallback(
    async (name: string) => {
      await createProjectRequest({
        name,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const updateProject = useCallback(
    async (id: number, updates: Partial<Omit<Project, "id">>) => {
      await updateProjectRequest({
        id,
        updates,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects: state.projects,
      isLoading: state.isLoading,
      error: state.error,
      refreshProjects: refresh,
      createProject,
      updateProject,
    }),
    [createProject, updateProject, refresh, state.error, state.isLoading, state.projects]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};
