import { useCallback, useEffect, useMemo, useReducer } from "react";

import { useAuth } from "../auth";


import { ProjectsContext } from "./ProjectsContext";
import type { Project } from "./reducer";
import { reducer, type Action } from "./reducer";
import { createProjectRequest, refreshProjects, updateProjectRequest, deleteProjectRequest } from "./actions";

import type { ProjectsContextValue } from "./ProjectsContext";

type Dispatch = (action: Action) => void;

export const ProjectsProvider = ({
   children,
  }: {
    children: React.ReactNode;
  }) => {
    const [state, dispatchBase] = useReducer(reducer, {
      projects: [],
      companyId: null,
      isLoading: false,
      error: null,
    });

    const dispatch = dispatchBase as Dispatch;

  const { user } = useAuth();
  // Ownership key for projects visibility is stored in members.createdBy.
  // MembersProvider may not be mounted above this provider, so we avoid hard dependency on useMembers().
  // Fallback: treat logged-in admin as the owner.
  const ownershipCreatedBy = user?.email || user?.username;


  const refresh = useCallback(
    async (companyId?: string | null) => {
      await refreshProjects({ dispatch, companyId, createdBy: ownershipCreatedBy });
    },
    [dispatch, ownershipCreatedBy]
  );

  const createProject = useCallback(
    async (project: { name: string; description?: string; date?: string; time?: string; assignedTo?: number; companyId?: string }) => {
      await createProjectRequest({
        ...project,
        dispatch,
        refresh,
        createdBy: ownershipCreatedBy,
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

   const deleteProject = useCallback(
     async (id: number) => {
       await deleteProjectRequest({
         id,
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
       deleteProject,
     }),
     [createProject, deleteProject, updateProject, refresh, state.error, state.isLoading, state.projects]
   );

   return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};
