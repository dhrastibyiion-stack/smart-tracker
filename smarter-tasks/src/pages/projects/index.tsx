import React, { Suspense } from "react";
import { useAuth } from "../../context/auth";

import NewProject from "./NewProject";
import ErrorBoundary from "../../components/ErrorBoundary";

const ProjectList = React.lazy(() => import("./ProjectList"));

const Projects = () => {
  const { role } = useAuth();
  const canCreateProject = role === "admin" || role === "projectManager";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          {canCreateProject && <NewProject />}
        </div>

        <ErrorBoundary>
          <Suspense fallback={<div className="suspense-loading">Loading...</div>}>
            <div className="mt-4">
              <ProjectList />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Projects;
