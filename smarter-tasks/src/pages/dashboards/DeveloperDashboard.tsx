import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/auth";
import { useTasks } from "../../context/tasks";
import { useMembers } from "../../context/members";
import { useProjects } from "../../context/projects";
import { useLeaveRequests } from "../../context/leaveRequests";
import { useTimeTracking } from "../../context/timeTracking";
import { TaskStatus } from "../../config/constants";
import type { Task } from "../../context/tasks/TasksContext";
import type { LeaveRequest } from "../../context/leaveRequests/LeaveRequestsContext";
import type { TimeLog } from "../../context/timeTracking/TimeTrackingContext";
import CommentDialog from "../../CommentDialog";
import "../leaveRequests/LeaveRequests.css";
import "../../TaskCard.css";

const DeveloperDashboard = () => {
  const { user, role, logout } = useAuth();
  const { tasks, updateTaskStatus, deleteTask, restoreTask, getDeletedTasks, updateTaskComments } = useTasks();
  const { members } = useMembers();
  const { projects } = useProjects();
  const { createLeaveRequest, leaveRequests } = useLeaveRequests();
  const { timeLogs, addTimeLog, deleteTimeLog, updateTimeLog, recordActivity } = useTimeTracking();
  const navigate = useNavigate();
  const canAccess = role === "dev";

  const loginRecordedRef = useRef(false);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showActivitySection, setShowActivitySection] = useState(false);
  const [leaveName, setLeaveName] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveTo, setLeaveTo] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");
  const [leaveError, setLeaveError] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState({ title: "", description: "", assignedTo: "", projectId: "" });
  const [editingTaskError, setEditingTaskError] = useState("");
  const [editingTaskSuccess, setEditingTaskSuccess] = useState("");

  const [activeCommentTaskId, setActiveCommentTaskId] = useState<number | null>(null);

  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const currentMemberId = members.find(
    (m) => m.email === user?.username || m.name === user?.name
  )?.id;

  const myTasks = tasks.filter((t) => t.assignedTo === currentMemberId && (t.companyId === user?.companyId || !t.companyId));
  const taskOptions = myTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.PENDING);

  const [logHours, setLogHours] = useState("");
  const [logDate, setLogDate] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [logTaskId, setLogTaskId] = useState("");
  const [logSuccess, setLogSuccess] = useState("");
  const [logError, setLogError] = useState("");

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editHours, setEditHours] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTaskId, setEditTaskId] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const memberMap = new Map<number, string>();
  members.forEach((m) => memberMap.set(m.id, m.name));

  const projectMap = new Map<string, string>();
  projects.forEach((p) => projectMap.set(String(p.id), p.name));

  const getAssigneeName = (taskAssigneeId: number | undefined) => {
    if (!taskAssigneeId) return "Unassigned";
    return memberMap.get(taskAssigneeId) || "Unknown";
  };

  const pendingTasks = useMemo(() => myTasks.filter((t) => t.status !== TaskStatus.COMPLETED), [myTasks]);
  const doneTasks = useMemo(() => myTasks.filter((t) => t.status === TaskStatus.COMPLETED), [myTasks]);

  const myLeaveRequests = useMemo(
    () => (leaveRequests || []).filter((lr) => lr.companyId === user?.companyId && (lr.requesterId === currentMemberId || lr.requesterName === user?.name)),
    [leaveRequests, user?.companyId, currentMemberId]
  );

  const myTimeLogs = useMemo(
    () => (timeLogs || []).filter((log) => (log.companyId === user?.companyId || !log.companyId) && log.userId === currentMemberId),
    [timeLogs, user?.companyId, currentMemberId]
  );

  useEffect(() => {
    setDeletedTasks(getDeletedTasks());
  }, [getDeletedTasks, tasks]);

  useEffect(() => {
    if (!user || !currentMemberId || loginRecordedRef.current) return;
    loginRecordedRef.current = true;

    recordActivity({
      userId: currentMemberId,
      userName: user.name,
      event: "login",
    }).catch(() => {
      loginRecordedRef.current = false;
    });
  }, [user, currentMemberId, recordActivity]);

  if (!canAccess) {
    return (
      <div className="pm-layout">
        <div className="pm-sidebar">
          <div className="pm-brand">
            <div className="brand-badge">S</div>
            <strong>Smarter Tasks</strong>
          </div>
        </div>
        <main className="pm-main">
          <h1>Access Denied</h1>
          <p>Only Developers can view this dashboard.</p>
        </main>
      </div>
    );
  }

  const handleLogout = async () => {
    if (currentMemberId && user?.name) {
      try {
        await recordActivity({
          userId: currentMemberId,
          userName: user.name,
          event: "logout",
        });
      } catch {}
    }
    logout();
    navigate("/", { replace: true });
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveError("");
    setLeaveMessage("");

    if (!leaveName.trim() || !leaveReason.trim() || !leaveFrom || !leaveTo) {
      setLeaveError("Please fill in all fields.");
      return;
    }

    if (new Date(leaveFrom) > new Date(leaveTo)) {
      setLeaveError("From date cannot be after To date.");
      return;
    }

    const start = new Date(leaveFrom);
    const end = new Date(leaveTo);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    try {
      await createLeaveRequest({
        requesterId: currentMemberId || 0,
        requesterName: leaveName.trim(),
        days,
        reason: leaveReason.trim(),
        startDate: leaveFrom,
        endDate: leaveTo,
        companyId: user?.companyId,
      });
      setLeaveMessage("Leave request submitted successfully.");
      setLeaveName("");
      setLeaveReason("");
      setLeaveFrom("");
      setLeaveTo("");
    } catch (err) {
      setLeaveMessage("");
      setLeaveError("Failed to submit leave request.");
    }
  };

  const requestDelete = (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this task? You can restore it later from the Trash.");
    if (confirmed) {
      setPendingDeleteId(id);
      deleteTask(id).then(() => {
        setDeletedTasks(getDeletedTasks());
        setPendingDeleteId(null);
      }).catch(() => setPendingDeleteId(null));
    }
  };

  const handleRestore = async (id: number) => {
    await restoreTask(id);
    setDeletedTasks(getDeletedTasks());
  };

  const handleAddComment = async (taskId: number, text: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const next = [...(task?.comments ?? []), text];
    await updateTaskComments(taskId, next);
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      title: task.title,
      description: task.description || "",
      projectId: task.projectId,
      assignedTo: task.assignedTo != null ? String(task.assignedTo) : "",
    });
    setEditingTaskError("");
    setEditingTaskSuccess("");
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTask({ title: "", description: "", assignedTo: "", projectId: "" });
    setEditingTaskError("");
    setEditingTaskSuccess("");
  };

  const saveEditTask = async () => {
    if (!editingTask.title.trim()) {
      setEditingTaskError("Title is required.");
      return;
    }
    setEditingTaskError("");
    setEditingTaskSuccess("");
    try {
      await updateTask(editingTaskId!, {
        title: editingTask.title.trim(),
        description: editingTask.description.trim(),
        projectId: editingTask.projectId,
        assignedTo: editingTask.assignedTo ? Number(editingTask.assignedTo) : undefined,
      });
      setEditingTaskSuccess("Task updated.");
      cancelEditTask();
    } catch {
      setEditingTaskError("Failed to update task.");
    }
  };

  const handleLogTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogError("");
    setLogSuccess("");

    if (!logTaskId || !logHours || !logDate || !logDescription.trim()) {
      setLogError("Please fill in all fields.");
      return;
    }

    try {
      await addTimeLog({
        taskId: Number(logTaskId),
        userId: currentMemberId || 0,
        userName: user?.name || "",
        hours: Number(logHours),
        date: new Date(logDate).toISOString(),
        description: logDescription.trim(),
        companyId: user?.companyId,
      });
      setLogSuccess("Time log saved.");
      setLogTaskId("");
      setLogHours("");
      setLogDate("");
      setLogDescription("");
    } catch (err) {
      setLogSuccess("");
      setLogError("Failed to save time log.");
    }
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateTaskStatusWithLog = async (id: number, status: string, task: Task) => {
    await updateTaskStatus(id, status);
    if (!currentMemberId || !user?.name) return;
    const event = status === TaskStatus.IN_PROGRESS ? "task_started" : status === TaskStatus.COMPLETED ? "task_completed" : undefined;
    if (!event) return;
    try {
      await recordActivity({
        userId: currentMemberId,
        userName: user.name,
        taskId: task.id,
        taskTitle: task.title,
        event,
      });
    } catch {}
  };

  const renderTaskCard = (t: Task, showDelete = false) => {
    const isPending = pendingDeleteId === t.id;
    const isEditing = editingTaskId === t.id;

    return (
      <li key={t.id} className="task-card">
        <div className="task-card-info">
          {isEditing ? (
            <>
              <input
                className="pm-input"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Task title"
              />
              <textarea
                className="pm-input"
                rows={3}
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, description: e.target.value })
                }
                placeholder="Description"
              />
              <select
                className="pm-input"
                value={editingTask.projectId}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, projectId: e.target.value })
                }
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className="pm-input"
                value={editingTask.assignedTo}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {editingTaskError && (
                <p className="danger-text">{editingTaskError}</p>
              )}
              {editingTaskSuccess && (
                <p className="success-text">{editingTaskSuccess}</p>
              )}
            </>
          ) : (
            <>
              <h3>{t.title}</h3>
              {t.description && <p className="task-card-desc">{t.description}</p>}
              <p>
                Project: <strong>{projectMap.get(t.projectId) || t.projectId}</strong>
              </p>
              <p>
                Assigned by: <strong>{t.creatorName || "Unassigned"}</strong>
              </p>
              {t.dueDate && (
                <p className="task-card-meta">
                  Due: {new Date(t.dueDate).toLocaleString()}
                </p>
              )}
              <p className="task-card-meta">
                Created: {formatDateTime(new Date(t.createdAt).toISOString())}
              </p>
              <p className="task-card-meta">
                Status:{" "}
                <span className={`status ${t.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {t.status}
                </span>
              </p>
            </>
          )}
        </div>
        <div className="task-card-actions">
          {isEditing ? (
            <>
              <button className="task-btn save" onClick={saveEditTask}>
                Save
              </button>
              <button className="task-btn cancel" onClick={cancelEditTask}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="task-btn edit"
                onClick={() => startEditTask(t)}
              >
                Edit
              </button>
              {t.status !== TaskStatus.COMPLETED && (
                <button
                  className="task-btn complete"
                  onClick={() => updateTaskStatusWithLog(t.id, TaskStatus.COMPLETED, t)}
                >
                  Complete
                </button>
              )}
               <button
                 className="task-btn danger"
                 onClick={() => requestDelete(t.id)}
                 disabled={isPending}
               >
                 {isPending ? "Deleting..." : "Delete"}
               </button>
                 <button
                   className="task-btn comment-btn"
                   onClick={() => setActiveCommentTaskId(t.id)}
                 >
                   Comment
                 </button>
             </>
          )}
        </div>
      </li>
    );
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
            className={`pm-nav-link ${!showLeaveForm && !showActivitySection ? "active" : ""}`}
            onClick={() => { setShowLeaveForm(false); setShowActivitySection(false); }}
          >
            My Tasks
          </button>
          <button
            className={`pm-nav-link ${showLeaveForm ? "active" : ""}`}
            onClick={() => { setShowLeaveForm(true); setShowActivitySection(false); }}
          >
            Apply for Leave
          </button>
          <button
            className={`pm-nav-link ${showActivitySection ? "active" : ""}`}
            onClick={() => { setShowActivitySection(true); setShowLeaveForm(false); }}
          >
            Log Time
          </button>
        </div>

        <div className="pm-user-info">
          <div style={{ marginBottom: "8px" }}>
            <span style={{ display: "block", fontSize: "13px", color: "#a0aec0" }}>Signed in as:</span>
            <strong style={{ color: "#e2e8f0", fontSize: "15px" }}>{user?.name}</strong>
          </div>
          <span style={{ fontSize: "12px", color: "#718096", wordBreak: "break-all" }}>{user?.email || user?.username}</span>
        </div>

        <button className="pm-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="pm-main">
        <header className="pm-header">
          <h1>Developer Dashboard</h1>
          <p>Welcome, {user?.name}.</p>
        </header>

        <div className="pm-content">
          {showLeaveForm ? (
            <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <div className="pm-leave-form-card">
                <h2 className="pm-leave-form-title">Apply for Leave</h2>

                {leaveError && (
                  <div className="pm-leave-message pm-leave-message-error">
                    {leaveError}
                  </div>
                )}
                {leaveMessage && (
                  <div className="pm-leave-message pm-leave-message-success">
                    {leaveMessage}
                  </div>
                )}

                <form className="pm-leave-form-grid" onSubmit={handleLeaveSubmit}>
                  <div className="pm-form-group">
                    <label htmlFor="leaveName">Name</label>
                    <input
                      id="leaveName"
                      className="pm-input"
                      type="text"
                      placeholder="Your name"
                      value={leaveName}
                      onChange={(e) => setLeaveName(e.target.value)}
                    />
                  </div>

                  <div className="pm-form-group">
                    <label htmlFor="leaveFrom">From</label>
                    <input
                      id="leaveFrom"
                      className="pm-input"
                      type="date"
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                    />
                  </div>

                  <div className="pm-form-group">
                    <label htmlFor="leaveTo">To</label>
                    <input
                      id="leaveTo"
                      className="pm-input"
                      type="date"
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                    />
                  </div>

                  <div className="pm-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="leaveReason">Reason</label>
                    <textarea
                      id="leaveReason"
                      className="pm-input"
                      rows={4}
                      placeholder="Reason for leave"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                    />
                  </div>

                  <div className="pm-leave-form-actions">
                    <button type="submit" className="pm-btn pm-btn-primary">
                      Submit Leave Request
                    </button>
                    <button
                      type="button"
                      className="pm-btn pm-btn-secondary"
                      onClick={() => setShowLeaveForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {(leaveName || leaveReason || leaveFrom || leaveTo) && (
                  <div className="pm-leave-preview">
                    <h3>Form Preview</h3>
                    <div className="pm-leave-preview-grid">
                      <div className="pm-preview-item">
                        <span className="pm-preview-label">Name</span>
                        <span className="pm-preview-value">{leaveName || "-"}</span>
                      </div>
                      <div className="pm-preview-item">
                        <span className="pm-preview-label">From</span>
                        <span className="pm-preview-value">{leaveFrom ? new Date(leaveFrom).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="pm-preview-item">
                        <span className="pm-preview-label">To</span>
                        <span className="pm-preview-value">{leaveTo ? new Date(leaveTo).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="pm-preview-item pm-preview-full">
                        <span className="pm-preview-label">Reason</span>
                        <span className="pm-preview-value">{leaveReason || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pm-leave-history">
                  <h3>Leave History</h3>
                  {(myLeaveRequests || []).length === 0 ? (
                    <p className="empty-state">No leave requests found.</p>
                  ) : (
                    <table className="pm-table">
                      <thead>
                        <tr>
                          <th>From</th>
                          <th>To</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(myLeaveRequests || [])
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((leave) => (
                            <tr key={leave.id}>
                              <td>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "-"}</td>
                              <td>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "-"}</td>
                              <td>{leave.reason}</td>
                              <td>{leave.status}</td>
                              <td>{formatDateTime(new Date(leave.createdAt).toISOString())}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          ) : showActivitySection ? (
            <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
              <h2>Log Time</h2>

              <div className="pm-log-time-form-card">
                <h3 className="pm-log-time-form-title">Submit Time Log</h3>
                {logError && (
                  <div className="pm-log-time-message pm-log-time-message-error">
                    {logError}
                  </div>
                )}
                {logSuccess && (
                  <div className="pm-log-time-message pm-log-time-message-success">
                    {logSuccess}
                  </div>
                )}
                <form className="pm-log-time-form-grid" onSubmit={handleLogTimeSubmit}>
                  <div className="pm-form-group">
                    <label htmlFor="logTaskId">Task</label>
                    <select
                      id="logTaskId"
                      className="pm-input"
                      value={logTaskId}
                      onChange={(e) => setLogTaskId(e.target.value)}
                    >
                      <option value="">Select task</option>
                      {taskOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pm-form-group">
                    <label htmlFor="logHours">Hours</label>
                    <input
                      id="logHours"
                      className="pm-input"
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="e.g. 1.5"
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                    />
                  </div>
                  <div className="pm-form-group">
                    <label htmlFor="logDate">Date</label>
                    <input
                      id="logDate"
                      className="pm-input"
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                    />
                  </div>
                  <div className="pm-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="logDescription">Description</label>
                    <textarea
                      id="logDescription"
                      className="pm-input"
                      rows={3}
                      placeholder="What did you work on?"
                      value={logDescription}
                      onChange={(e) => setLogDescription(e.target.value)}
                    />
                  </div>
                  <div className="pm-log-time-form-actions">
                    <button type="submit" className="pm-btn pm-btn-primary">
                      Save Log
                    </button>
                    <button
                      type="button"
                      className="pm-btn pm-btn-secondary"
                      onClick={() => {
                        setLogTaskId("");
                        setLogHours("");
                        setLogDate("");
                        setLogDescription("");
                        setLogError("");
                        setLogSuccess("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {myTimeLogs.length === 0 ? (
                <p className="empty-state">Log activity not found.</p>
              ) : (
                <div className="pm-activity-grid">
                  {[...myTimeLogs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => {
                      const isEditing = editingLogId === entry.id;
                      return (
                        <div key={entry.id} className="pm-activity-cell">
                          <div className="pm-activity-cell-header">{formatDateTime(entry.date)}</div>
                          {isEditing ? (
                            <div className="pm-log-time-edit-form">
                              <div className="pm-form-group">
                                <label htmlFor={`editHours-${entry.id}`}>Hours</label>
                                <input
                                  id={`editHours-${entry.id}`}
                                  className="pm-input"
                                  type="number"
                                  min={0}
                                  step={0.1}
                                  value={editHours}
                                  onChange={(e) => setEditHours(e.target.value)}
                                />
                              </div>
                              <div className="pm-form-group">
                                <label htmlFor={`editDate-${entry.id}`}>Date</label>
                                <input
                                  id={`editDate-${entry.id}`}
                                  className="pm-input"
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                />
                              </div>
                              <div className="pm-form-group" style={{ gridColumn: "1 / -1" }}>
                                <label htmlFor={`editDesc-${entry.id}`}>Description</label>
                                <textarea
                                  id={`editDesc-${entry.id}`}
                                  className="pm-input"
                                  rows={3}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                />
                              </div>
                              <div className="pm-log-time-form-actions">
                                <button
                                  type="button"
                                  className="pm-btn pm-btn-primary"
                                  onClick={async () => {
                                    if (!editDescription.trim()) {
                                      setEditMessage("Description is required.");
                                      return;
                                    }
                                    await updateTimeLog({
                                      ...entry,
                                      hours: Number(editHours),
                                      date: new Date(editDate).toISOString(),
                                      description: editDescription.trim(),
                                    });
                                    setEditingLogId(null);
                                    setEditMessage("");
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="pm-btn pm-btn-secondary"
                                  onClick={() => {
                                    setEditingLogId(null);
                                    setEditMessage("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="pm-activity-cell-mode">{entry.event?.replace("_", " ") ?? "activity"}</div>
                              <div className="pm-activity-cell-body">{entry.taskTitle || "Session event"}</div>
                              <div className="pm-activity-cell-meta">
                                {!!entry.hours && <span className="pm-activity-chip">{entry.hours} hr(s)</span>}
                                {!!entry.taskId && <span className="pm-activity-chip">#{entry.taskId}</span>}
                              </div>
                              {!!entry.description && (
                                <div className="pm-activity-cell-desc">{entry.description}</div>
                              )}
                              <div className="pm-actions">
                                <button
                                  className="pm-btn pm-btn-ghost"
                                  onClick={() => {
                                    setEditingLogId(entry.id);
                                    setEditHours(String(entry.hours ?? ""));
                                    setEditDate(entry.date?.slice(0, 10) ?? "");
                                    setEditDescription(entry.description ?? "");
                                    setEditMessage("");
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="pm-btn pm-btn-danger"
                                  onClick={async () => {
                                    if (window.confirm("Delete this log entry?")) {
                                      await deleteTimeLog(entry.id);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {editMessage && (
                <div className="pm-log-time-message pm-log-time-message-error" style={{ marginTop: 12 }}>
                  {editMessage}
                </div>
              )}
            </section>
          ) : (
            <>
              <section className="pm-section">
                <h2>Pending Tasks</h2>
                {pendingTasks.length === 0 ? (
                  <p className="empty-state">No pending tasks.</p>
                ) : (
                  <ul className="task-list">
                    {pendingTasks.map((t) => renderTaskCard(t, true))}
                  </ul>
                )}
              </section>

              <section className="pm-section">
                <h2>Done Tasks</h2>
                {doneTasks.length === 0 ? (
                  <p className="empty-state">No completed tasks yet.</p>
                ) : (
                  <ul className="task-list">
                    {doneTasks.map((t) => renderTaskCard(t, false))}
                  </ul>
                )}
              </section>

              {deletedTasks.length > 0 && (
                <section className="pm-section" style={{ gridColumn: "1 / -1" }}>
                  <h2>Trash</h2>
                  <ul className="task-list">
                    {deletedTasks.map((t) => (
                      <li key={t.id} className="task-card task-card-trash">
                        <div className="task-card-info">
              <h3>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>Task: </span>
                <strong>{t.title}</strong>
              </h3>
                          {t.description && <p className="task-card-desc">{t.description}</p>}
                          <p>Project: <strong>{projectMap.get(t.projectId) || t.projectId}</strong></p>
                          <p>Status: <span className={`status ${t.status.toLowerCase().replace(/\s+/g, "-")}`}>{t.status}</span></p>
                          <p className="task-card-meta">Deleted: {formatDateTime(t.deletedAt || undefined)}</p>
                        </div>
                        <div className="task-card-actions">
                          <button
                            className="task-btn restore"
                            onClick={() => handleRestore(t.id)}
                          >
                            Restore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {activeCommentTaskId != null && (() => {
        const task = tasks.find((t) => t.id === activeCommentTaskId);
        if (!task) return null;
        return (
          <CommentDialog
            task={{ id: String(task.id), title: task.title, comments: task.comments ?? [] }}
            onClose={() => setActiveCommentTaskId(null)}
            onAddComment={(text) => handleAddComment(task.id, text)}
          />
        );
      })()}
    </div>
  );
};

export default DeveloperDashboard;
