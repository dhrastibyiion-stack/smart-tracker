import { useState } from "react";
import { useAuth } from "../context/auth";
import { useTasks, type Task } from "../context/tasks";
import { useProjects, type Project } from "../context/projects";
import { useMembers, type Member } from "../context/members";
import { useLeaveRequests, type LeaveRequest } from "../context/leaveRequests";
import { TaskStatus, RequestStatus, UserRole } from "../config/constants";

const AdminDashboard = () => {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";

  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { members, createMember, deleteMember } = useMembers();
  const { leaveRequests, createLeaveRequest, updateLeaveRequestStatus } = useLeaveRequests();

  const [newTask, setNewTask] = useState({ title: "", projectId: "", assignedTo: undefined as number | undefined });
  const [newProject, setNewProject] = useState("");
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: UserRole.DEV });
  const [newLeave, setNewLeave] = useState({ days: 1, reason: "", requesterName: "", requesterId: 0 });

  if (!isAdmin) {
    return (
      <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) return;
    createTask({ 
      title: newTask.title, 
      projectId: newTask.projectId, 
      assignedTo: newTask.assignedTo,
      createdAt: Date.now()
    });
    setNewTask({ title: "", projectId: "", assignedTo: undefined });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    createProject(newProject.trim());
    setNewProject("");
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.password.trim()) return;
    createMember({ name: newMember.name, email: newMember.email, password: newMember.password, role: newMember.role });
    setNewMember({ name: "", email: "", password: "", role: UserRole.DEV });
  };

  const handleCreateLeaveForMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.requesterName.trim() || !newLeave.reason.trim()) return;
    createLeaveRequest({
      requesterId: newLeave.requesterId,
      requesterName: newLeave.requesterName,
      days: newLeave.days,
      reason: newLeave.reason,
    });
    setNewLeave({ days: 1, reason: "", requesterName: "", requesterId: 0 });
  };

  const handleLeaveStatus = (id: number, status: RequestStatus) => {
    updateLeaveRequestStatus(id, status);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", backgroundColor: "#fff5f5", minHeight: "100vh" }}>
      <h1 style={{ color: "#c53030" }}>👑 Admin Dashboard</h1>
      <p>Welcome, {user?.name}. Full control over the organization.</p>
      <hr />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        <section style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h2>📋 Task Management</h2>
          <form onSubmit={handleCreateTask} style={{ marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} style={{ padding: "6px", flex: 1, minWidth: "150px" }} />
            <input type="text" placeholder="Project ID (e.g. PRJ-102)" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })} style={{ padding: "6px", flex: 1, minWidth: "150px" }} />
            <select 
              value={newTask.assignedTo ?? ""} 
              onChange={(e) => {
                const value = e.target.value;
                setNewTask({ ...newTask, assignedTo: value ? parseInt(value, 10) : undefined });
              }}
              style={{ padding: "6px", minWidth: "150px" }}
            >
              <option value="">Assign to...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Add Task</button>
          </form>

            <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasksLoading ? (
                  <tr>
                    <td colSpan={7}>Loading...</td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const assignee = members.find((m) => m.id === task.assignedTo);
                    const assigneeName = assignee ? assignee.name : "Unassigned";
                    const createdDate = new Date(task.createdAt).toLocaleString();
                    return (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.title}</td>
                        <td>{task.projectId}</td>
                        <td>{assigneeName}</td>
                        <td>{task.status}</td>
                        <td>{createdDate}</td>
                        <td>
                          <button onClick={() => updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)} style={{ marginRight: "5px", fontSize: "12px" }}>Start</button>
                          <button onClick={() => updateTaskStatus(task.id, TaskStatus.COMPLETED)} style={{ marginRight: "5px", background: "#63b3ed", fontSize: "12px" }}>Complete</button>
                          <button onClick={() => deleteTask(task.id)} style={{ background: "#e53e3e", color: "white", fontSize: "12px" }}>Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
        </section>

        <section style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h2>📁 Projects</h2>
          <form onSubmit={handleCreateProject} style={{ marginBottom: "15px", display: "flex", gap: "8px" }}>
            <input type="text" placeholder="New Project Name" value={newProject} onChange={(e) => setNewProject(e.target.value)} style={{ padding: "6px", flex: 1 }} />
            <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Create</button>
          </form>
          <ul>
            {projects.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </section>

        <section style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h2>👥 Members</h2>
          <form onSubmit={handleCreateMember} style={{ marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="text" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} style={{ padding: "6px", flex: 1 }} />
            <input type="email" placeholder="Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} style={{ padding: "6px", flex: 1 }} />
            <input type="password" placeholder="Password" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} style={{ padding: "6px", flex: 1 }} />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value as UserRole })}
              style={{ padding: "6px" }}
            >
              <option value={UserRole.DEV}>Developer</option>
              <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
            <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Add Member</button>
          </form>
          <ul>
            {members.map((m) => (
              <li key={m.id} style={{ marginBottom: "8px" }}>
                {m.name} ({m.email})
                <button onClick={() => deleteMember(m.id)} style={{ marginLeft: "10px", background: "#e53e3e", color: "white", fontSize: "12px" }}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginTop: "24px" }}>
        <h2>📅 Leave Requests</h2>
        <form onSubmit={handleCreateLeaveForMember} style={{ marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input type="text" placeholder="Requester Name" value={newLeave.requesterName} onChange={(e) => setNewLeave({ ...newLeave, requesterName: e.target.value, requesterId: Date.now() })} style={{ padding: "6px" }} />
          <input type="number" min={1} value={newLeave.days} onChange={(e) => setNewLeave({ ...newLeave, days: parseInt(e.target.value, 10) || 1 })} style={{ padding: "6px", width: "60px" }} />
          <input type="text" placeholder="Reason" value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} style={{ padding: "6px", flex: 1 }} />
          <button type="submit" style={{ padding: "6px 12px", background: "#38a169", color: "white", border: "none", borderRadius: "4px" }}>Create Leave</button>
        </form>
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
    </div>
  );
};

export default AdminDashboard;

