import { useProjects } from "../../context/projects";

const ProjectList = () => {
  const { projects, isLoading, error } = useProjects();

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-md border border-gray-200 px-3 py-2 text-gray-800"
            >
              {project.name}
            </li>
          ))}
        </ul>
      )}

      {projects.length === 0 && !isLoading && !error ? (
        <div className="mt-4 text-gray-500">No projects yet.</div>
      ) : null}
    </div>
  );
};

export default ProjectList;
