import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";
import { useTasks } from "../../context/tasks";
import { useProjects } from "../../context/projects";
import { useMembers } from "../../context/members";
import { useLeaveRequests } from "../../context/leaveRequests";
import { useTimeTracking } from "../../context/timeTracking";
import { TaskStatus, RequestStatus } from "../../config/constants";
import "../../pm-dashboard.css";
import "../../pm-status.css";


const ProjectManagerDashboard = () => {
  const { user, role, logout } = useAuth();
  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { projects, isLoading: projectsLoading, updateProject } = useProjects();
  const { members, isLoading: membersLoading } = useMembers();
  const { leaveRequests, updateLeaveRequest, deleteLeaveRequest, updateLeaveRequestStatus } = useLeaveRequests();
  const { timeLogs, isLoading: timeLoading } = useTimeTracking();
  const navigate = useNavigate();
  const canAccess = role === "projectManager" || role === "admin";

  const isProjectManager = role === "projectManager";

  const currentMemberId = members.find(
    (m) => m.email === user?.username || m.name === user?.name
  )?.id;

  const companyMemberIds = useMemo(() => new Set(
    members.filter((m) => m.companyId === user?.companyId || !m.companyId).map((m) => m.id)
  ), [members, user?.companyId]);

  const myProjects = projects.filter((p) => p.assignedTo === currentMemberId && (p.companyId === user?.companyId || !p.companyId));
  const myTasks = tasks.filter((t) => myProjects.some((p) => String(p.id) === String(t.projectId)) && (t.companyId === user?.companyId || !t.companyId));

  const pendingLeaves = useMemo(() => leaveRequests.filter((l) => l.status === RequestStatus.PENDING && (l.companyId === user?.companyId || !l.companyId)), [leaveRequests, user?.companyId]);

  const visibleLeaveRequests = useMemo(
    () => (user?.companyId ? leaveRequests.filter((l) => l.companyId === user?.companyId || !l.companyId) : leaveRequests),
    [leaveRequests, user?.companyId]
  );

  const [activeSection, setActiveSection] = useState<"projects" | "tasks" | "members" | "leaves" | "developer-work">("projects");

  const [newTask, setNewTask] = useState({ title: "", projectId: "", assignedTo: "" });
  const [editingLeaveId, setEditingLeaveId] = useState<number | null>(null);
  const [editingLeave, setEditingLeave] = useState({ requesterName: "", leaveType: "Casual" as "Casual" | "Sick" | "UnPaid", days: 1, reason: "", startDate: "", endDate: "" });
  const [selfLeave, setSelfLeave] = useState({ leaveType: "Casual" as "Casual" | "Sick" | "UnPaid", days: 1, reason: "", startDate: "", endDate: "", requesterId: user?.email || "", requesterName: user?.name || "" });
  const [newLeave, setNewLeave] = useState({ requesterId: 0, requesterName: "", leaveType: "Casual" as "Casual" | "Sick" | "UnPaid", days: 1, reason: "", startDate: "", endDate: "" });

  const memberMap = new Map<number, string>();
  members.forEach((m) => memberMap.set(m.id, m.name));

  const projectMap = new Map<string, string>();
  projects.forEach((p) => projectMap.set(String(p.id), p.name));

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
      companyId: user?.companyId,
      createdBy: user?.email,
    });
    setNewTask({ title: "", projectId: "", assignedTo: "" });
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.requesterName.trim() || !newLeave.reason.trim() || !newLeave.startDate || !newLeave.endDate) return;
    createLeaveRequest({
      requesterId: newLeave.requesterId,
      requesterName: newLeave.requesterName.trim(),
      leaveType: newLeave.leaveType,
      days: newLeave.days,
      reason: newLeave.reason.trim(),
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      companyId: user?.companyId,
    });
    setNewLeave({ requesterName: "", requesterId: 0, leaveType: "Casual", days: 1, reason: "", startDate: "", endDate: "" });
  };

  const handleSubmitSelfLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfLeave.reason.trim() || !selfLeave.startDate || !selfLeave.endDate || !user?.name || !user?.companyId) return;
    createLeaveRequest({
      requesterId: currentMemberId,
      requesterName: user.name,
      leaveType: selfLeave.leaveType,
      days: selfLeave.days,
      reason: selfLeave.reason.trim(),
      startDate: selfLeave.startDate,
      endDate: selfLeave.endDate,
      companyId: user.companyId,
    });
    setSelfLeave({ leaveType: "Casual", days: 1, reason: "", startDate: "", endDate: "" });
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

  const computeLeaveDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;
    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    if (diffMs < 0) return 1;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const startEditLeave = (leave: {
    id: number;
    requesterName: string;
    leaveType: "Casual" | "Sick" | "UnPaid";
    days: number;
    reason: string;
    startDate: string;
    endDate: string;
  }) => {
    setEditingLeaveId(leave.id);
    setEditingLeave({
      requesterName: leave.requesterName,
      leaveType: leave.leaveType,
      days: leave.days,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
    });
  };

  const cancelEditLeave = () => {
    setEditingLeaveId(null);
    setEditingLeave({ requesterName: "", leaveType: "Casual", days: 1, reason: "", startDate: "", endDate: "" });
  };

  const saveEditLeave = async (id: number) => {
    if (!editingLeave.requesterName.trim() || !editingLeave.reason.trim() || !editingLeave.startDate || !editingLeave.endDate) return;
    await updateLeaveRequest(id, {
      days: computeLeaveDays(editingLeave.startDate, editingLeave.endDate),
      reason: editingLeave.reason.trim(),
      startDate: editingLeave.startDate,
      endDate: editingLeave.endDate,
    });
    cancelEditLeave();
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
            <span className="nav-icon">📁</span> Projects
          </button>
          <button
            className={activeSection === "tasks" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("tasks")}
          >
            <span className="nav-icon">📋</span> Tasks
          </button>
          <button
            className={activeSection === "members" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("members")}
          >
            <span className="nav-icon">👥</span> Team
          </button>
          <button
            className={activeSection === "leaves" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("leaves")}
          >
            📝 Leaves
          </button>
          <button
            className={activeSection === "developer-work" ? "pm-nav-link active" : "pm-nav-link"}
            onClick={() => setActiveSection("developer-work")}
          >
            ⏱ Developer Logs
          </button>
        </div>

        <div className="pm-user-info">
          <div style={{ marginBottom: "8px" }}>
            <span style={{ display: "block", fontSize: "13px", color: "#a0aec0" }}>Signed in as:</span>
            <strong style={{ color: "#e2e8f0", fontSize: "15px" }}>{user?.name}</strong>
          </div>
          <span className="pm-role-badge">{isProjectManager ? "Project Manager" : "Admin"}</span>
        </div>
        <button className="pm-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="pm-main">
        <header className="pm-header">
          <h1>📊 Project Manager Dashboard</h1>
          <p>Welcome back, {user?.name}! Manage your assigned projects, create tasks, and review team leave requests.</p>
        </header>

        <div className="pm-content">
          {activeSection === "projects" && (
               <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <h2>📁 My Projects</h2>
              {projectsLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading projects...</p>
              ) : myProjects.length === 0 ? (
                <div style={{ 
                  padding: "32px", 
                  textAlign: "center", 
                  background: "#f8fafc", 
                  borderRadius: "8px", 
                  border: "1px dashed #cbd5e0" 
                }}>
                  <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
                    No projects assigned to you yet. Admin will assign projects.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {myProjects.map((p) => (
                    <div key={p.id} style={{ 
                      background: "white", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px", 
                      padding: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h3 style={{ margin: 0, color: "#2d3748" }}>{p.name}</h3>
                          <p style={{ margin: "4px 0 0 0", color: "#718096", fontSize: "14px" }}>
                            Project ID: {p.id}
                          </p>
                        </div>
                        {editingProjectId === p.id ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => saveEditProject(p.id)} style={{ 
                              padding: "6px 12px", 
                              background: "#38a169", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}>Save</button>
                            <button onClick={cancelEditProject} style={{ 
                              padding: "6px 12px", 
                              background: "#718096", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => startEditProject({ id: p.id, name: p.name })} style={{ 
                            padding: "6px 12px", 
                            background: "#edf2f7", 
                            color: "#4a5568", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "4px",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}>Edit</button>
                        )}
                      </div>
                      {editingProjectId === p.id && (
                        <input
                          type="text"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          style={{ 
                            marginTop: "12px", 
                            padding: "8px", 
                            width: "100%", 
                            border: "1px solid #cbd5e0", 
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                          autoFocus
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "tasks" && (
            <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <h2>📋 Tasks</h2>
              <form onSubmit={handleCreateTask} style={{ 
                marginBottom: "20px", 
                padding: "16px", 
                background: "#f8fafc", 
                borderRadius: "8px", 
                border: "1px solid #e2e8f0",
                display: "flex", 
                gap: "12px", 
                flexWrap: "wrap" 
              }}>
                <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} style={{ padding: "8px 12px", flex: "1 1 200px", borderRadius: "4px", border: "1px solid #cbd5e0" }} />
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  style={{ padding: "8px 12px", flex: "1 1 180px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                >
                  <option value="">Select Project</option>
{myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  style={{ padding: "8px 12px", flex: "1 1 180px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                >
                  <option value="">Assign to Developer</option>
                  {members.filter(m => m.role === "dev").map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button type="submit" style={{ 
                  padding: "8px 20px", 
                  background: "#38a169", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  fontWeight: "600"
                }}>Create Task</button>
              </form>

              {tasksLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading tasks...</p>
              ) : myTasks.length === 0 ? (
                <div style={{ 
                  padding: "32px", 
                  textAlign: "center", 
                  background: "#f8fafc", 
                  borderRadius: "8px", 
                  border: "1px dashed #cbd5e0" 
                }}>
                  <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>No tasks found. Create a task above.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {myTasks.map((t) => (
                    <div key={t.id} style={{ 
                      background: "white", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px", 
                      padding: "16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#2d3748", fontWeight: "600" }}>{t.title}</h4>
                        <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#718096" }}>
                          <span>Project: <strong style={{ color: "#4a5568" }}>{t.projectId ? projectMap.get(t.projectId) ?? t.projectId : "—"}</strong></span>
                          <span>Developer: <strong style={{ color: "#4a5568" }}>{t.assignedTo ? memberMap.get(t.assignedTo) ?? t.assignedTo : "—"}</strong></span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "13px",
                            fontWeight: "600",
                            background: t.status === TaskStatus.COMPLETED ? "#c6f6d5" : t.status === TaskStatus.IN_PROGRESS ? "#bee3f8" : "#fed7d7",
                            color: t.status === TaskStatus.COMPLETED ? "#276749" : t.status === TaskStatus.IN_PROGRESS ? "#2c5282" : "#c53030"
                          }}
                        >
                          {t.status}
                        </span>
                        {t.status !== TaskStatus.COMPLETED && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleTaskStatus(t.id, TaskStatus.IN_PROGRESS)} style={{ 
                              padding: "6px 12px", 
                              background: "#63b3ed", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}>Start</button>
                            <button onClick={() => handleTaskStatus(t.id, TaskStatus.COMPLETED)} style={{ 
                              padding: "6px 12px", 
                              background: "#38a169", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}>Complete</button>
                            <button onClick={() => deleteTask(t.id)} style={{ 
                              padding: "6px 12px", 
                              background: "#e53e3e", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "members" && (
               <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <h2>👥 Team Overview</h2>
              {membersLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading members...</p>
              ) : members.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No team members found.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <h3 style={{ 
                      margin: "0 0 12px 0", 
                      padding: "8px 12px", 
                      background: "#ebf8ff", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2b6cb0"
                    }}>💻 Developers ({members.filter(m => m.role === "dev").length})</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {members.filter(m => m.role === "dev").map((m) => (
                        <div key={m.id} style={{ 
                          background: "white", 
                          border: "1px solid #e2e8f0", 
                          borderRadius: "6px", 
                          padding: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <span style={{ fontWeight: "600", color: "#2d3748" }}>{m.name}</span>
                            <span style={{ fontSize: "12px", color: "#718096", marginLeft: "8px" }}>{m.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: "0 0 12px 0", 
                      padding: "8px 12px", 
                      background: "#e6fffa", 
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#234e52"
                    }}>📋 Project Managers ({members.filter(m => m.role === "projectManager").length})</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {members.filter(m => m.role === "projectManager").map((m) => (
                        <div key={m.id} style={{ 
                          background: "white", 
                          border: "1px solid #e2e8f0", 
                          borderRadius: "6px", 
                          padding: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <span style={{ fontWeight: "600", color: "#2d3748" }}>{m.name}</span>
                            <span style={{ fontSize: "12px", color: "#718096", marginLeft: "8px" }}>{m.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === "leaves" && (
            <section className="pm-section" style={{ gridColumn: "1/-1" }}>
              <h2>📝 Leave Requests</h2>
              {visibleLeaveRequests.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No leave requests found.</p>
              ) : (
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeaveRequests.map((leave) => {
                      const isSelf = currentMemberId != null && leave.requesterId === currentMemberId;
                      const isEditing = editingLeaveId === leave.id;
                      return (
                        <tr key={leave.id}>
                          <td>
                            {isEditing ? <input style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.requesterName} onChange={(e) => setEditingLeave({ ...editingLeave, requesterName: e.target.value })} /> : <>{leave.requesterName}{isSelf ? " (You)" : ""}</>}
                          </td>
                          <td>
                            {isEditing ? <select style={{ padding: "6px 8px" }} value={editingLeave.leaveType} onChange={(e) => setEditingLeave({ ...editingLeave, leaveType: e.target.value as "Casual" | "Sick" | "UnPaid" })}><option value="Casual">Casual</option><option value="Sick">Sick</option><option value="UnPaid">UnPaid</option></select> : leave.leaveType}
                          </td>
                          <td>
                            <span style={{ fontSize: "12px" }}>
                              {isEditing ? <><input type="date" style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.startDate} onChange={(e) => setEditingLeave({ ...editingLeave, startDate: e.target.value })} /> <span style={{ padding: "0 4px" }}>→</span> <input type="date" style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.endDate} onChange={(e) => setEditingLeave({ ...editingLeave, endDate: e.target.value })} /></> : <><span style={{ fontSize: "12px" }}>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "-"} → {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "-"}</span><br /><span style={{ color: "#718096", fontSize: "12px" }}>{leave.days} day(s)</span></>}
                            </span>
                          </td>
                          <td>{isEditing ? <textarea style={{ padding: "6px 8px", minWidth: "160px" }} value={editingLeave.reason} onChange={(e) => setEditingLeave({ ...editingLeave, reason: e.target.value })} /> : leave.reason}</td>
                          <td>
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: leave.status === RequestStatus.APPROVED ? "#c6f6d5" : leave.status === RequestStatus.REJECTED || leave.status === RequestStatus.DENIED ? "#fed7d7" : "#feebc8",
                                color: leave.status === RequestStatus.APPROVED ? "#276749" : leave.status === RequestStatus.REJECTED || leave.status === RequestStatus.DENIED ? "#c53030" : "#c05621"
                              }}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            <div className="pm-actions" style={{ flexWrap: "wrap" }}>
                              {leave.status === RequestStatus.PENDING && !isSelf && (
                                <>
                                  <button className="pm-btn pm-btn-primary" onClick={() => handleLeaveStatus(leave.id, RequestStatus.APPROVED)}>Approve</button>
                                  <button className="pm-btn pm-btn-reject" onClick={() => handleLeaveStatus(leave.id, RequestStatus.REJECTED)}>Reject</button>
                                </>
                              )}
                              {isEditing ? (
                                <>
                                  <button className="pm-btn" style={{ background: "#38a169", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "13px" }} onClick={() => saveEditLeave(leave.id)}>Save</button>
                                  <button className="pm-btn" style={{ background: "#718096", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "13px" }} onClick={cancelEditLeave}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button className="pm-btn" style={{ background: "#63b3ed", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "13px" }} onClick={() => startEditLeave(leave)}>Edit</button>
                                  <button className="pm-btn" style={{ background: "#e53e3e", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "13px" }} onClick={() => deleteLeaveRequest(leave.id)}>Delete</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {activeSection === "developer-work" && (
            <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <h2>⏱ Developer Time Logs</h2>
              {timeLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading time logs...</p>
              ) : timeLogs.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No time logs submitted yet.</p>
              ) : (
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Developer</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Task</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeLogs.map((log) => {
                      const task = tasks.find((t) => t.id === log.taskId);
                      return (
                        <tr key={log.id}>
                          <td>{log.userName}</td>
                          <td>{new Date(log.date).toLocaleDateString()}</td>
                          <td>{log.hours}</td>
                          <td>{task?.title || log.taskTitle || "Task #" + log.taskId}</td>
                          <td>{log.description || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;