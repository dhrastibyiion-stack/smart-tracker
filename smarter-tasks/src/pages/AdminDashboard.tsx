import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useTasks } from "../context/tasks";
import { useProjects } from "../context/projects";
import { useMembers } from "../context/members";
import { useLeaveRequests } from "../context/leaveRequests";
import { useTimeTracking } from "../context/timeTracking";
import { RequestStatus, UserRole } from "../config/constants";
import "../admin-dashboard.css";

type TaskCreateState = {
  title: string;
  projectId: string;
  description?: string;
  date?: string;
  assignedTo?: number;
};

const AdminDashboard = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { members: allMembers, createMember, deleteMember } = useMembers();
  const { leaveRequests, updateLeaveRequest, deleteLeaveRequest } = useLeaveRequests();
  const { timeLogs, isLoading: timeLogsLoading } = useTimeTracking();

  const myCompanyId = user?.companyId;
  const companyMembers = useMemo(
    () => allMembers.filter((m) => m.companyId === myCompanyId || !m.companyId),
    [allMembers, myCompanyId]
  );
  const projectManagers = useMemo(
    () => companyMembers.filter((m) => m.role === UserRole.PROJECT_MANAGER),
    [companyMembers]
  );
  const pendingLeaves = useMemo(() => leaveRequests.filter((l) => l.status === RequestStatus.PENDING), [leaveRequests]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "In Progress"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "Completed"), [tasks]);
  const completedTaskIds = useMemo(() => new Set(completedTasks.map((t) => t.id)), [completedTasks]);

  const visibleTasks = useMemo(
    () => (myCompanyId ? tasks.filter((t) => t.companyId === myCompanyId) : tasks),
    [tasks, myCompanyId]
  );

  const companyProjects = useMemo(
    () => (myCompanyId ? projects.filter((p) => p.companyId === myCompanyId) : projects),
    [projects, myCompanyId]
  );

  const visibleLeaveRequests = useMemo(
    () => (myCompanyId ? leaveRequests.filter((l) => l.companyId === myCompanyId) : leaveRequests),
    [leaveRequests, myCompanyId]
  );

  const visibleTimeLogs = useMemo(
    () => (myCompanyId ? timeLogs.filter((log) => log.companyId === myCompanyId) : timeLogs),
    [timeLogs, myCompanyId]
  );


  const [activeSection, setActiveSection] = useState<"tasks" | "projects" | "companyMembers" | "leaves" | "devlogs">("tasks");


  const [newTask, setNewTask] = useState<TaskCreateState>({ title: "", projectId: "", description: "", date: "", assignedTo: undefined });
  const [newProject, setNewProject] = useState({ name: "", description: "", date: "", assignedTo: "" });
  const [newMember, setNewMember] = useState<{ name: string; email: string; password: string; role: UserRole }>({ name: "", email: "", password: "", role: UserRole.DEV });
  const [editingLeaveId, setEditingLeaveId] = useState<number | null>(null);
  const [editingLeave, setEditingLeave] = useState({ requesterName: "", leaveType: "Casual" as "Casual" | "Sick" | "UnPaid", days: 1, reason: "", startDate: "", endDate: "" });

  const dateInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="admin-access">
        <div className="admin-access-card">
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId || !myCompanyId) return;
    createTask({
      title: newTask.title,
      projectId: newTask.projectId,
      description: newTask.description || undefined,
      date: newTask.date || undefined,
      assignedTo: newTask.assignedTo,
      companyId: myCompanyId,
    });
    setNewTask({ title: "", projectId: "", description: "", date: "", status: "Todo", assignedTo: undefined });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !myCompanyId) return;
    createProject({
      name: newProject.name,
      description: newProject.description || undefined,
      date: newProject.date || undefined,
      assignedTo: newProject.assignedTo ? Number(newProject.assignedTo) : undefined,
      companyId: myCompanyId,
    });
    setNewProject({ name: "", description: "", date: "", assignedTo: "" });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.password.trim() || !myCompanyId) return;
    createMember({ name: newMember.name, email: newMember.email, password: newMember.password, role: newMember.role, companyId: myCompanyId, createdBy: user?.email ?? "" });
    setNewMember({ name: "", email: "", password: "", role: UserRole.DEV });
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

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-badge">S</div>
          <strong>{myCompanyId ? `${myCompanyId} Admin` : 'Admin'}</strong>
        </div>

        <div className="admin-nav-links">
          <button className={`admin-nav-link ${activeSection === "tasks" ? "active" : ""}`} onClick={() => setActiveSection("tasks")}>
            <span className="nav-icon">📋</span> Tasks
          </button>
          <button className={`admin-nav-link ${activeSection === "projects" ? "active" : ""}`} onClick={() => setActiveSection("projects")}>
            <span className="nav-icon">📁</span> Projects
          </button>
          <button className={`admin-nav-link ${activeSection === "companyMembers" ? "active" : ""}`} onClick={() => setActiveSection("companyMembers")}>
            <span className="nav-icon">👥</span> Members
          </button>
          <button className={`admin-nav-link ${activeSection === "leaves" ? "active" : ""}`} onClick={() => setActiveSection("leaves")}>
            <span className="nav-icon">📝</span> Leaves
          </button>
          <button className={`admin-nav-link ${activeSection === "devlogs" ? "active" : ""}`} onClick={() => setActiveSection("devlogs")}>
            <span className="nav-icon">🕒</span> Developer Logs
          </button>
        </div>

        <div className="admin-user-area">
          <div className="admin-user-name">Signed in as:<br /><strong>{user?.name}</strong></div>
          <span className="admin-role-badge">{myCompanyId ? `Company: ${myCompanyId}` : 'Admin'}</span>
        </div>
        <button className="admin-logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Here's what's happening right now.</p>
        </header>

        <div className="admin-kpi-grid">
          <div className="admin-kpi primary">
            <div className="admin-kpi-label">Total Tasks</div>
            <div className="admin-kpi-value">{visibleTasks.length}</div>
            <div className="admin-kpi-sub">{inProgressTasks.length} in progress</div>
          </div>
          <div className="admin-kpi success">
            <div className="admin-kpi-label">Completed</div>
            <div className="admin-kpi-value">{completedTasks.length}</div>
            <div className="admin-kpi-sub">Successful delivery</div>
          </div>
          <div className="admin-kpi warning">
            <div className="admin-kpi-label">Projects</div>
            <div className="admin-kpi-value">{companyProjects.length}</div>
            <div className="admin-kpi-sub">Active initiatives</div>
          </div>
          <div className="admin-kpi alert">
            <div className="admin-kpi-label">Leave Requests</div>
            <div className="admin-kpi-value">{visibleLeaveRequests.length}</div>
            <div className="admin-kpi-sub">{pendingLeaves.length} pending action</div>
          </div>
          <div className="admin-kpi">
            <div className="admin-kpi-label">Members</div>
            <div className="admin-kpi-value">{companyMembers.length}</div>
            <div className="admin-kpi-sub">Teams organized</div>
          </div>
        </div>

        {activeSection === "tasks" && (
          <section className="admin-section">
            <h2>Task Management</h2>
            <form onSubmit={handleCreateTask} className="admin-form">
              <div className="admin-form-row">
                <label>Task title</label>
                <input className="admin-input" type="text" placeholder="e.g. Fix payment bug" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>Project</label>
                <select className="admin-input" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}>
                  <option value="">Select project</option>
                  {companyProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="admin-form-row">
                <label>Assign to</label>
                <select
                  className="admin-input"
                  value={newTask.assignedTo ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTask({ ...newTask, assignedTo: value ? parseInt(value, 10) : undefined });
                  }}
                >
                  <option value="">Unassigned</option>
                   {companyMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </div>
              <div className="admin-form-row admin-date-row">
                <label>Date</label>
                <div className="admin-date-input-wrap">
                  <input ref={dateInputRef} className="admin-input" type="date" value={newTask.date} onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} />
                  <button type="button" className="admin-date-icon" onClick={openDatePicker} aria-label="Open calendar">📅</button>
                </div>
              </div>
              <button type="submit" className="admin-btn admin-btn-success">Add Task</button>
            </form>
            {tasksLoading ? (
              <p className="admin-empty">Loading...</p>
            ) : visibleTasks.length === 0 ? (
              <p className="admin-empty admin-empty-detail">No tasks yet. Create one above to see it here with full details.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Assignee</th>
                      <th>Date</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map((task) => {
                      const assignee = companyMembers.find((m) => m.id === task.assignedTo);
                      const project = companyProjects.find((p) => String(p.id) === String(task.projectId));
                      const rowStatus = task.status === "Completed" ? "Complete" : "In Progress";
                      const rowStatusClass = task.status === "Completed" ? "admin-pill-ok" : "admin-pill-warn";
                      return (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>{project ? project.name : task.projectId}</td>
                          <td>{assignee ? assignee.name : "Unassigned"}</td>
                          <td><span className="admin-date">{task.date || "-"}</span></td>
                          <td><span className="admin-date">{new Date(task.createdAt).toLocaleDateString()}</span></td>
                          <td>
                            <span className={`admin-pill ${rowStatusClass}`}>{rowStatus}</span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              {task.status !== "In Progress" && task.status !== "Completed" && (
                                <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => updateTaskStatus(task.id, "In Progress")}>Start</button>
                              )}
                              {task.status === "In Progress" && (
                                <button className="admin-btn admin-btn-info admin-btn-sm" onClick={() => updateTaskStatus(task.id, "Completed")}>Complete</button>
                              )}
                              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteTask(task.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === "projects" && (
          <section className="admin-section">
            <h2>Projects</h2>
            <form onSubmit={handleCreateProject} className="admin-form">
              <div className="admin-form-row">
                <label>Project name</label>
                <input className="admin-input" type="text" placeholder="e.g. Launch tracker v2" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>Description</label>
                <input className="admin-input" type="text" placeholder="Short description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>Date</label>
                <input className="admin-input" type="date" value={newProject.date} onChange={(e) => setNewProject({ ...newProject, date: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>Assign to (PM only)</label>
                <select className="admin-input" value={newProject.assignedTo} onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                   {projectManagers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <button type="submit" className="admin-btn admin-btn-success">Create Project</button>
            </form>
            {companyProjects.length === 0 ? (
              <p className="admin-empty">No projects found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyProjects.map((p) => {
                      const assignee = companyMembers.find((m) => String(m.id) === String(p.assignedTo));
                      const projectTasks = visibleTasks.filter((t) => String(t.projectId) === String(p.id));
                      const taskCount = projectTasks.length;
                      const allCompleted = taskCount > 0 && projectTasks.every((t) => t.status === "Completed");
                      const statusLabel = allCompleted ? "Complete" : "In Progress";
                      const statusClass = allCompleted ? "admin-pill-ok" : "admin-pill-warn";
                      return (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.description || "-"}</td>
                          <td><span className="admin-date">{p.date || "-"}</span></td>
                          <td>{assignee ? assignee.name : "Unassigned"}</td>
                          <td>
                            <span className={`admin-pill ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td>
                            <span className="admin-pill admin-pill-ghost">{taskCount} task(s)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === "companyMembers" && (
          <section className="admin-section">
            <h2>Members</h2>
            <form onSubmit={handleCreateMember} className="admin-form">
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="admin-form-row" style={{ flex: "1 1 160px", minWidth: "140px" }}>
                  <label>Name</label>
                  <input className="admin-input" type="text" placeholder="Jane" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                </div>
                <div className="admin-form-row" style={{ flex: "1 1 220px", minWidth: "180px" }}>
                  <label>Email</label>
                  <input className="admin-input" type="email" placeholder="jane@example.com" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                </div>
                <div className="admin-form-row" style={{ flex: "1 1 160px", minWidth: "140px" }}>
                  <label>Password</label>
                  <input className="admin-input" type="password" placeholder="Secret" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
                </div>
                <div className="admin-form-row" style={{ flex: "0 0 auto", minWidth: "130px" }}>
                  <label>Role</label>
                  <select className="admin-input" value={newMember.role} onChange={(e) => {
                    const value = e.target.value;
                    setNewMember({ ...newMember, role: value as UserRole });
                  }} style={{ minWidth: "130px", borderRadius: "10px" }}>
                    <option value={UserRole.DEV}>Developer</option>
                    <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                  </select>
                </div>
                <button type="submit" className="admin-btn admin-btn-success" style={{ marginBottom: "2px" }}>Add Member</button>
              </div>
            </form>
            {companyMembers.length === 0 ? (
              <p className="admin-empty">No companyMembers found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyMembers.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>
                          <span className={`admin-pill ${m.role === UserRole.ADMIN ? "admin-pill-err" : m.role === UserRole.PROJECT_MANAGER ? "admin-pill-warn" : "admin-pill-ghost"}`}>
                            {m.role}
                          </span>
                        </td>
                        <td>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteMember(m.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === "leaves" && (
          <section className="admin-section">
            <h2>Leave Requests</h2>
            {visibleLeaveRequests.length === 0 ? (
              <p className="admin-empty">No leave requests found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ width: "140px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeaveRequests.map((leave) => {
                      const isEditing = editingLeaveId === leave.id;
                      const leaveRow = () => (
                        <tr key={leave.id}>
                          <td>
                            {isEditing ? <input className="admin-input" style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.requesterName} onChange={(e) => setEditingLeave({ ...editingLeave, requesterName: e.target.value })} /> : leave.requesterName}
                          </td>
                          <td>
                            {isEditing ? <select className="admin-input" style={{ padding: "6px 8px" }} value={editingLeave.leaveType} onChange={(e) => setEditingLeave({ ...editingLeave, leaveType: e.target.value as "Casual" | "Sick" | "UnPaid" })}><option value="Casual">Casual</option><option value="Sick">Sick</option><option value="UnPaid">UnPaid</option></select> : leave.leaveType}
                          </td>
                          <td>
                            <span style={{ fontSize: "12px" }}>
                              {isEditing ? <><input type="date" className="admin-input" style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.startDate} onChange={(e) => setEditingLeave({ ...editingLeave, startDate: e.target.value })} /> <span style={{ padding: "0 4px" }}>→</span> <input type="date" className="admin-input" style={{ padding: "6px 8px", minWidth: "120px" }} value={editingLeave.endDate} onChange={(e) => setEditingLeave({ ...editingLeave, endDate: e.target.value })} /></> : <><span style={{ fontSize: "12px" }}>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "-"} → {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "-"}</span><br /><span style={{ color: "#718096", fontSize: "12px" }}>{leave.days} day(s)</span></>}
                            </span>
                          </td>
                          <td>{isEditing ? <textarea className="admin-input" style={{ padding: "6px 8px", minWidth: "160px" }} value={editingLeave.reason} onChange={(e) => setEditingLeave({ ...editingLeave, reason: e.target.value })} /> : leave.reason}</td>
                          <td>
                            <span className={`admin-pill ${leave.status === RequestStatus.APPROVED ? "admin-pill-ok" : leave.status === RequestStatus.REJECTED || leave.status === RequestStatus.DENIED ? "admin-pill-err" : "admin-pill-warn"}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions" style={{ flexWrap: "wrap" }}>
                              {leave.status === RequestStatus.PENDING && (
                                <>
                                  <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleLeaveStatus(leave.id, RequestStatus.APPROVED)}>Approve</button>
                                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleLeaveStatus(leave.id, RequestStatus.REJECTED)}>Reject</button>
                                </>
                              )}
                              {isEditing ? (
                                <>
                                  <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => saveEditLeave(leave.id)}>Save</button>
                                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={cancelEditLeave}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button className="admin-btn admin-btn-info admin-btn-sm" onClick={() => startEditLeave(leave)}>Edit</button>
                                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteLeaveRequest(leave.id)}>Delete</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                      return leaveRow();
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === "devlogs" && (
          <section className="admin-section">
            <h2>Developer Logs</h2>
            {timeLogsLoading ? (
              <p className="admin-empty">Loading logs...</p>
            ) : (visibleTimeLogs.length ?? 0) === 0 ? (
              <p className="admin-empty">No developer logs found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Developer</th>
                      <th>Task</th>
                      <th>Hours</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...visibleTimeLogs]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((log) => {
                        const task = visibleTasks.find((t) => t.id === log.taskId);
                        return (
                          <tr key={log.id}>
                            <td>{log.userName}</td>
                            <td>{task?.title || `#${log.taskId}`}</td>
                            <td>{log.hours}</td>
                            <td>{log.date ? new Date(log.date).toLocaleDateString() : "-"}</td>
                            <td>{log.description || "-"}</td>
                            <td>{log.event ? log.event.replace("_", " ") : "-"}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
