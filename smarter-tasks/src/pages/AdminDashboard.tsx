import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useTasks } from "../context/tasks";
import { useProjects } from "../context/projects";
import { useMembers } from "../context/members";
import { useLeaveRequests } from "../context/leaveRequests";
import { useTimeTracking } from "../context/timeTracking";
import { RequestStatus, UserRole } from "../config/constants";
import { type Member } from "../context/members";
import "../admin-dashboard.css";

type TaskCreateState = {
  title: string;
  projectId: string;
  description?: string;
  date?: string;
  assignedTo?: number;
};

type LeaveCreateState = {
  requesterName: string;
  requesterId: number;
  days: number;
  reason: string;
  startDate: string;
  endDate: string;
};

const AdminDashboard = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const { tasks, isLoading: tasksLoading, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { members: allMembers, createMember, deleteMember } = useMembers();
  const { leaveRequests, createLeaveRequest, updateLeaveRequestStatus } = useLeaveRequests();
  const { timeLogs, isLoading: timeLogsLoading } = useTimeTracking();

  const myCompanyId = user?.companyId;
  const companyMembers = useMemo(
    () => allMembers.filter((m) => m.companyId === myCompanyId || !m.companyId),
    [allMembers, myCompanyId]
  );
  const pendingLeaves = useMemo(() => leaveRequests.filter((l) => l.status === RequestStatus.PENDING), [leaveRequests]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "In Progress"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "Completed"), [tasks]);

  const [activeSection, setActiveSection] = useState<"tasks" | "projects" | "members" | "leaves" | "devlogs">("tasks");
  const [newTask, setNewTask] = useState<TaskCreateState>({ title: "", projectId: "", description: "", date: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "", date: "", assignedTo: "" });
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: UserRole.DEV });
  const [newLeave, setNewLeave] = useState<LeaveCreateState>({ requesterName: "", requesterId: 0, days: 1, reason: "", startDate: "", endDate: "" });

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
    setNewTask({ title: "", projectId: "", description: "", date: "" });
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

  const handleCreateLeaveForMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.requesterName.trim() || !newLeave.reason.trim() || !newLeave.startDate || !newLeave.endDate || !myCompanyId) return;
    createLeaveRequest({
      requesterId: newLeave.requesterId,
      requesterName: newLeave.requesterName,
      days: newLeave.days,
      reason: newLeave.reason,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      companyId: myCompanyId,
    });
    setNewLeave({ requesterName: "", requesterId: 0, days: 1, reason: "", startDate: "", endDate: "" });
  };

  const handleLeaveStatus = (id: number, status: RequestStatus) => {
    updateLeaveRequestStatus(id, status);
  };

  const dateInputRef = useRef<HTMLInputElement>(null);

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
                <label>Project ID</label>
                <input className="admin-input" type="text" placeholder="e.g. PRJ-102" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })} />
              </div>
              <div className="admin-form-row admin-date-row">
                <label>Date</label>
                <div className="admin-date-input-wrap">
                  <input ref={dateInputRef} className="admin-input" type="date" value={newTask.date} onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} />
                  <button type="button" className="admin-date-icon" onClick={openDatePicker} aria-label="Open calendar">📅</button>
                </div>
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
              <button type="submit" className="admin-btn admin-btn-success">Add Task</button>
            </form>
            {tasksLoading ? (
              <p className="admin-empty">Loading...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
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
                    {visibleTasks.map((task) => {
                      const assignee = companyMembers.find((m) => m.id === task.assignedTo);
                      return (
                        <tr key={task.id}>
                          <td>{task.id}</td>
                          <td>{task.title}</td>
                          <td>{task.projectId}</td>
                          <td>{assignee ? assignee.name : "Unassigned"}</td>
                          <td>
                            <span className={`admin-pill ${task.status === "Completed" ? "admin-pill-ok" : task.status === "In Progress" ? "admin-pill-warn" : "admin-pill-ghost"}`}>
                              {task.status}
                            </span>
                          </td>
                          <td><span className="admin-date">🗓️ {new Date(task.createdAt).toLocaleDateString()}</span></td>
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
                <label>Assign to</label>
                <select className="admin-input" value={newProject.assignedTo} onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                   {companyMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
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
                      <th>Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyProjects.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>
                          <span className="admin-pill admin-pill-ghost">{visibleTasks.filter((t) => String(t.projectId) === String(p.id)).length} tasks</span>
                        </td>
                      </tr>
                    ))}
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
                    if (value === UserRole.DEV || value === UserRole.PROJECT_MANAGER) {
                      setNewMember({ ...newMember, role: value });
                    }
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
            <form onSubmit={handleCreateLeaveForMember} className="admin-form">
              <div className="admin-form-row">
                <label>Requester name</label>
                <input className="admin-input" type="text" placeholder="Jane" value={newLeave.requesterName} onChange={(e) => setNewLeave({ ...newLeave, requesterName: e.target.value, requesterId: Date.now() })} />
              </div>
              <div className="admin-form-row">
                <label>Days</label>
                <input className="admin-input" type="number" min={1} value={newLeave.days} onChange={(e) => setNewLeave({ ...newLeave, days: parseInt(e.target.value, 10) || 1 })} />
              </div>
              <div className="admin-form-row">
                <label>Start date</label>
                <input className="admin-input" type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>End date</label>
                <input className="admin-input" type="date" value={newLeave.endDate} onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <label>Reason</label>
                <input className="admin-input" type="text" placeholder="Family travel" value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} />
              </div>
              <button type="submit" className="admin-btn admin-btn-success">Create Leave</button>
            </form>
            {visibleLeaveRequests.length === 0 ? (
              <p className="admin-empty">No leave requests found.</p>
            ) : (
              <div>
                {visibleLeaveRequests.map((leave) => (
                  <div key={leave.id} className="admin-leave-card">
                    <div className="admin-leave-header">
                      <div>
                        <h3 className="admin-leave-name">{leave.requesterName}</h3>
                        <div className="admin-leave-meta">
                          <span>⏳ {leave.days} day(s)</span>
                          <span className={`admin-pill ${leave.status === RequestStatus.APPROVED ? "admin-pill-ok" : leave.status === RequestStatus.REJECTED || leave.status === RequestStatus.DENIED ? "admin-pill-err" : "admin-pill-warn"}`}>
                            {leave.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="admin-leave-reason">{leave.reason}</p>
                    {leave.status === RequestStatus.PENDING && (
                      <div className="admin-leave-actions">
                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleLeaveStatus(leave.id, RequestStatus.APPROVED)}>Approve</button>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleLeaveStatus(leave.id, RequestStatus.REJECTED)}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
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
