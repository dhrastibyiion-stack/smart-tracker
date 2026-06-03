import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useTasks } from "../../context/tasks";
import { useProjects } from "../../context/projects";
import { useMembers } from "../../context/members";
import { useLeaveRequests } from "../../context/leaveRequests";
import { TaskStatus, RequestStatus } from "../../config/constants";

const ProjectManagerDashboard = () => {
  const { user, role, logout } = useAuth();
  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { projects, isLoading: projectsLoading, createProject, updateProject } = useProjects();
  const { members, isLoading: membersLoading } = useMembers();
  const { leaveRequests, updateLeaveRequestStatus } = useLeaveRequests();
  const navigate = useNavigate();
  const canAccess = role === "projectManager" || role === "admin";

  const [activeSection, setActiveSection] = useState<"projects" | "tasks" | "members" | "leaves">("projects");

  const [newTask, setNewTask] = useState({ title: "", projectId: "", assignedTo: "" });
  const [newProject, setNewProject] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");

  if (!canAccess) {
    return (
      <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
        <h1>Access Denied</h1>
        <p>Only Project Managers and Admins can view this dashboard.</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) return;
    createTask({
      title: newTask.title,
      projectId: newTask.projectId,
      assignedTo: newTask.assignedTo ? Number(newTask.assignedTo) : undefined,
    });
    setNewTask({ title: "", projectId: "", assignedTo: "" });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    createProject(newProject.trim());
    setNewProject("");
  };

  const startEditProject = (project: { id: number; name: string }) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const saveEditProject = (id: number) => {
    if (!editingProjectName.trim()) return;
    updateProject(id, { name: editingProjectName.trim() });
    cancelEditProject();
  };

  const handleTaskStatus = (id: number, status: TaskStatus) => {
    updateTaskStatus(id, status);
  };

  const handleLeaveStatus = (id: number, status: RequestStatus) => {
    updateLeaveRequestStatus(id, status);
  };

  return (
    <div className="pm-layout">
      <nav className="pm-sidebar">
        <div className="pm-brand">
          <div className="brand-badge">S</div>
          <strong>Smarter Tasks</strong>
        </div>

        <div className="pm-nav-links">
          <button
            className={activeSection === "projects" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("projects")}
          >
             Projects
          </button>
          <button
            className={activeSection === "tasks" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("tasks")}
          >
             Tasks
          </button>
          <button
            className={activeSection === "members" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("members")}
          >
             Members
          </button>
          <button
            className={activeSection === "leaves" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("leaves")}
          >
             Leave Requests
          </button>
        </div>

        <button className="pm-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="pm-main">
        <header className="pm-header">
          <h1>Project Manager Dashboard</h1>
          <p>Welcome, {user?.name}. You can manage projects, tasks, review leave requests, and view members.</p>
        </header>

        <div className="pm-content">
          {activeSection === "projects" && (
            <section className="pm-section">
              <h2> Projects</h2>
              <form onSubmit={handleCreateProject} style={{ marginBottom: "15px", display: "flex", gap: "8px" }}>
                <input type="text" placeholder="New Project Name" value={newProject} onChange={(e) => setNewProject(e.target.value)} style={{ padding: "6px", flex: 1 }} />
                <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Create</button>
              </form>
              {projectsLoading ? <p>Loading...</p> : (
                <ul>
                  {projects.map((p) => (
                    <li key={p.id} style={{ marginBottom: "8px" }}>
                      {editingProjectId === p.id ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={editingProjectName}
                            onChange={(e) => setEditingProjectName(e.target.value)}
                            style={{ padding: "4px", flex: 1 }}
                          />
                          <button onClick={() => saveEditProject(p.id)} style={{ padding: "4px 8px", background: "#38a169", color: "white", border: "none", borderRadius: "4px", fontSize: "12px" }}>Save</button>
                          <button onClick={cancelEditProject} style={{ padding: "4px 8px", background: "#718096", color: "white", border: "none", borderRadius: "4px", fontSize: "12px" }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span>{p.name}</span>
                          <button onClick={() => startEditProject({ id: p.id, name: p.name })} style={{ fontSize: "12px" }}>Edit</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeSection === "tasks" && (
            <section className="pm-section">
              <h2> Tasks</h2>
              <form onSubmit={handleCreateTask} style={{ marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} style={{ padding: "6px", flex: 1 }} />
                <input type="text" placeholder="Project ID" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })} style={{ padding: "6px", flex: 1 }} />
                <input type="number" placeholder="Dev ID" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} style={{ padding: "6px", width: "80px" }} />
                <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Create</button>
              </form>
              {tasksLoading ? <p>Loading...</p> : (
                <ul>
                  {tasks.map((t) => (
                    <li key={t.id} style={{ marginBottom: "8px" }}>
                      {t.title} ({t.projectId}) – <strong>{t.status}</strong>
                      <div style={{ marginTop: "5px" }}>
                        <button onClick={() => handleTaskStatus(t.id, TaskStatus.IN_PROGRESS)} style={{ marginRight: "5px", fontSize: "12px" }}>Start</button>
                        <button onClick={() => handleTaskStatus(t.id, TaskStatus.COMPLETED)} style={{ marginRight: "5px", background: "#63b3ed", fontSize: "12px" }}>Complete</button>
                        <button onClick={() => deleteTask(t.id)} style={{ background: "#e53e3e", color: "white", fontSize: "12px" }}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeSection === "members" && (
            <section className="pm-section">
              <h2>Team Members</h2>
              {membersLoading ? <p>Loading...</p> : (
                <ul>
                  {members.map((m) => (
                    <li key={m.id}>{m.name} ({m.email})</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeSection === "leaves" && (
            <section className="pm-section">
              <h2> Leave Requests</h2>
              <ul>
                {leaveRequests.map((leave) => (
                  <li key={leave.id} style={{ marginBottom: "8px" }}>
                    {leave.requesterName} – {leave.days} day(s) – {leave.reason} – <strong>{leave.status}</strong>
                    {leave.status === RequestStatus.PENDING && (
                      <>
                        <button onClick={() => handleLeaveStatus(leave.id, RequestStatus.APPROVED)} style={{ marginLeft: "8px", background: "#38a169", color: "white", fontSize: "12px" }}>Approve</button>
                        <button onClick={() => handleLeaveStatus(leave.id, RequestStatus.REJECTED)} style={{ marginLeft: "5px", background: "#718096", color: "white", fontSize: "12px" }}>Reject</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;

