import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useTasks } from "../../context/tasks";
import { useMembers } from "../../context/members";
import { useLeaveRequests } from "../../context/leaveRequests";
import { useProjects } from "../../context/projects";
import { useComments } from "../../context/comments";
import { useTimeTracking } from "../../context/timeTracking";
import { TaskStatus, RequestStatus } from "../../config/constants";

const DeveloperDashboard = () => {
  const { user, role, logout } = useAuth();
  const { tasks, isLoading: tasksLoading, updateTaskStatus } = useTasks();
  const { members, isLoading: membersLoading } = useMembers();
  const { leaveRequests, isLoading: leavesLoading, createLeaveRequest, deleteLeaveRequest } = useLeaveRequests();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { comments, isLoading: commentsLoading, addComment } = useComments();
  const { timeLogs, isLoading: timeLoading, addTimeLog } = useTimeTracking();
  const navigate = useNavigate();
  const canAccess = role === "dev"; // Only developers

  const [activeSection, setActiveSection] = useState<"tasks" | "leaves">("tasks");
  const [newLeave, setNewLeave] = useState({ startDate: "", endDate: "", reason: "" });
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveSuccess, setLeaveSuccess] = useState<string | null>(null);
  const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [timeTaskId, setTimeTaskId] = useState<number | null>(null);
  const [timeHours, setTimeHours] = useState<number>(0);
  const [timeDate, setTimeDate] = useState<string>("");
  const [timeDescription, setTimeDescription] = useState<string>("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [timeSuccess, setTimeSuccess] = useState<string | null>(null);

  // Find the current member's id by matching the user's username to member's email or name
  const currentMemberId = members.find(
    (m) => m.email === user?.username || m.name === user?.name
  )?.id;

  // Filter tasks assigned to the current member
  const myTasks = tasks.filter((t) => t.assignedTo === currentMemberId);

  // Filter leave requests by the current member's id
  const myLeaveRequests = leaveRequests.filter((lr) => lr.requesterId === currentMemberId);

   // Create a map for project names (projectId as string -> project name)
   const projectMap = new Map<string, string>();
   projects.forEach((p) => {
     projectMap.set(p.id.toString(), p.name);
   });

   // Calculate work overview stats
   const currentTask = myTasks.find((t) => t.status === TaskStatus.IN_PROGRESS) || myTasks[0] || null;
   const pendingTasks = myTasks.filter((t) => t.status !== TaskStatus.COMPLETED).length;
   const completedTasks = myTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
   
   // Calculate leave taken (approved leave requests)
   const leaveTakenDays = myLeaveRequests
     .filter((lr) => lr.status === RequestStatus.APPROVED)
     .reduce((sum, lr) => sum + lr.days, 0);
   
   // Calculate time logged today (simplified - you might want to filter by actual today)
   const today = new Date().toISOString().split('T')[0];
   const timeLoggedToday = timeLogs
     .filter((log) => log.date === today)
     .reduce((sum, log) => sum + log.hours, 0);

   if (!canAccess) {
    return (
      <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
        <h1>Access Denied</h1>
        <p>Only Developers can view this dashboard.</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveError(null);
    setLeaveSuccess(null);

    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason || !currentMemberId) {
      setLeaveError("Please fill in all fields");
      return;
    }

    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setLeaveError("Invalid date selected");
      return;
    }

    if (endDate < startDate) {
      setLeaveError("End date must be after start date");
      return;
    }

    // Calculate inclusive days: (end - start) / (24*60*60*1000) + 1
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    createLeaveRequest({
      requesterId: currentMemberId,
      requesterName: user?.name ?? "",
      days: days,
      reason: newLeave.reason,
    })
    .then(() => {
      setLeaveSuccess("Leave request submitted successfully!");
      setNewLeave({ startDate: "", endDate: "", reason: "" });
    })
    .catch((error) => {
      setLeaveError("Failed to submit leave request. Please try again.");
      console.error("Leave request error:", error);
     });
   };

   const handleCreateComment = async (e: React.FormEvent) => {
     e.preventDefault();
     setCommentError(null);
     setCommentSuccess(null);

     if (!commentTaskId || !newComment.trim() || !currentMemberId) {
       setCommentError("Please select a task and enter a comment");
       return;
     }

     try {
       await addComment({
         taskId: commentTaskId,
         authorId: currentMemberId,
         authorName: user?.name ?? "",
         content: newComment.trim(),
       });
       setCommentSuccess("Comment added successfully!");
       setNewComment("");
       setCommentTaskId(null);
     } catch (error) {
       setCommentError("Failed to add comment. Please try again.");
       console.error("Comment error:", error);
     }
   };

   const handleCreateTimeLog = async (e: React.FormEvent) => {
     e.preventDefault();
     setTimeError(null);
     setTimeSuccess(null);

     if (!timeTaskId || timeHours <= 0 || !timeDate || !currentMemberId) {
       setTimeError("Please select a task, enter hours, and select a date");
       return;
     }

     try {
       await addTimeLog({
         taskId: timeTaskId,
         userId: currentMemberId,
         userName: user?.name ?? "",
         hours: timeHours,
         date: timeDate,
         description: timeDescription,
       });
       setTimeSuccess("Time log added successfully!");
       setTimeTaskId(null);
       setTimeHours(0);
       setTimeDate("");
       setTimeDescription("");
     } catch (error) {
       setTimeError("Failed to add time log. Please try again.");
       console.error("Time log error:", error);
     }
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
             className={activeSection === "tasks" ? "pm-nav-link active" : "pm-nav-link"}
             onClick={() => setActiveSection("tasks")}
           >
              My Tasks
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
           <h1>Developer Dashboard</h1>
           <p>Welcome, {user?.name}. View your assigned tasks and manage your leave requests.</p>
         </header>

         {/* Work Overview */}
         <div style={{ 
           backgroundColor: "#f8fafc", 
           padding: "20px", 
           borderRadius: "8px", 
           border: "1px solid #e2e8f0",
           marginBottom: "24px"
         }}>
           <h2 style={{ margin: "0 0 16px 0", color: "#2d3748" }}>Work Overview</h2>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ fontWeight: "600", color: "#4a5568" }}>Role:</span>
               <span style={{ color: "#2d3748" }}>{user?.role?.toUpperCase() || "DEV"}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ fontWeight: "600", color: "#4a5568" }}>Current Task:</span>
               <span style={{ color: "#2d3748", fontStyle: "italic" }}>
                 {currentTask ? `${currentTask.title} ${currentTask.projectId ? `(${projectMap.get(currentTask.projectId) || currentTask.projectId})` : ""}` : "No active task"}
               </span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ fontWeight: "600", color: "#4a5568" }}>Tasks:</span>
               <span style={{ color: "#2d3748" }}>
                 {pendingTasks} pending • {completedTasks} completed
               </span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ fontWeight: "600", color: "#4a5568" }}>Leave Taken:</span>
               <span style={{ color: "#2d3748" }}>{leaveTakenDays} days</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between" }}>
               <span style={{ fontWeight: "606", color: "#4a5568" }}>Time Logged (Today):</span>
               <span style={{ color: "#2d3748" }}>{timeLoggedToday} hours</span>
             </div>
           </div>
         </div>

         <div className="pm-content">
          {activeSection === "tasks" && (
            <section className="pm-section">
              <h2> My Assigned Tasks</h2>
                {(tasksLoading || membersLoading || projectsLoading || commentsLoading || timeLoading) ? (
                  <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading your tasks...</p>
              ) : (
                myTasks.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                    No tasks assigned to you yet. Contact your project manager for task assignments.
                  </p>
                 ) : (
                   <ul style={{ listStyle: "none", padding: 0 }}>
{myTasks.map((t) => {
                        return (
                         <li key={t.id} style={{ 
                           marginBottom: "16px", 
                           padding: "16px", 
                           border: "1px solid #e2e8f0", 
                           borderRadius: "8px",
                           backgroundColor: "#f8fafc"
                         }}>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <h3 style={{ margin: "0 0 8px 0", color: "#2d3748" }}>{t.title}</h3>
                                <p style={{ margin: "0 0 12px 0", color: "#4a5568" }}>
                                  Project: <strong>{projectMap.get(t.projectId) || t.projectId}</strong>
                                </p>
                                <p style={{ margin: "0", fontSize: "14px", color: "#718096" }}>
                                  Status: 
                                  <span style={{ 
                                    textTransform: "capitalize", 
                                    fontWeight: "600",
                                    color: t.status === TaskStatus.COMPLETED ? "#38a169" :
                                         t.status === TaskStatus.IN_PROGRESS ? "#63b3ed" :
                                         "#e53e3e"
                                  }}>
                                    {t.status}
                                  </span>
                                </p>
                                
                                {/* Comments Section */}
                                {(() => {
                                  const taskComments = comments.filter(c => c.taskId === t.id);
                                  
                                  return taskComments.length > 0 ? (
                                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                                      <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#2d3748" }}>Comments ({taskComments.length})</p>
                                      {taskComments.map((comment) => (
                                        <div key={comment.id} style={{ 
                                          marginBottom: "8px", 
                                          padding: "8px", 
                                          backgroundColor: "#f1f5f9",
                                          borderRadius: "4px"
                                        }}>
                                          <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#1e293b" }}>
                                            {comment.authorName}
                                          </p>
                                          <p style={{ margin: "0", color: "#475569" }}>
                                            {comment.content}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null;
                                })()}
                                
                                {/* Add Comment Form */}
                                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #cbd5e0" }}>
                                    {commentError && <p style={{ color: "#e53e3e", marginBottom: "8px" }}>{commentError}</p>}
                                    {commentSuccess && <p style={{ color: "#38a169", marginBottom: "8px" }}>{commentSuccess}</p>}
                                    <form onSubmit={handleCreateComment} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                      <select
                                        value={commentTaskId || ""}
                                        onChange={(e) => setCommentTaskId(e.target.value ? parseInt(e.target.value) : null)}
                                        style={{ 
                                          flex: "1 1 200px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      >
                                        <option value="">Select a task to comment</option>
                                        {myTasks.map((task) => (
                                          <option key={task.id} value={task.id}>
                                            {task.title}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        style={{ 
                                          flex: "2 1 300px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      />
                                      <button
                                        type="submit"
                                        style={{ 
                                          padding: "8px 16px", 
                                          background: "#38a169", 
                                          color: "white", 
                                          border: "none", 
                                          borderRadius: "4px",
                                          fontSize: "14px",
                                          cursor: "pointer",
                                          transition: "background-color 0.2s"
                                        }}
                                      >
                                        Add Comment
                                      </button>
                                    </form>
                                  </div>
                                
                                {/* Time Tracking Section */}
                                {/* Filter time logs for this task */}
                                {(() => {
                                  const taskTimeLogs = timeLogs.filter(l => l.taskId === t.id);
                                  const totalHours = taskTimeLogs.reduce((sum, log) => sum + log.hours, 0);
                                  
                                  return taskTimeLogs.length > 0 ? (
                                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                                      <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#2d3748" }}>Time Logged ({totalHours} hours)</p>
                                      {taskTimeLogs.map((log) => (
                                        <div key={log.id} style={{ 
                                          marginBottom: "8px", 
                                          padding: "8px", 
                                          backgroundColor: "#f1f5f9",
                                          borderRadius: "4px"
                                        }}>
                                          <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#1e293b" }}>
                                            {log.userName}
                                          </p>
                                          <p style={{ margin: "0", color: "#475569" }}>
                                            {log.hours} hours on {new Date(log.date).toLocaleDateString()} - {log.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null;
                                })()}
                                
                                {/* Add Time Log Form */}
                                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #cbd5e0" }}>
                                    {timeError && <p style={{ color: "#e53e3e", marginBottom: "8px" }}>{timeError}</p>}
                                    {timeSuccess && <p style={{ color: "#38a169", marginBottom: "8px" }}>{timeSuccess}</p>}
                                    <form onSubmit={handleCreateTimeLog} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                      <select
                                        value={timeTaskId || ""}
                                        onChange={(e) => setTimeTaskId(e.target.value ? parseInt(e.target.value) : null)}
                                        style={{ 
                                          flex: "1 1 200px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      >
                                        <option value="">Select a task to log time</option>
                                        {myTasks.map((task) => (
                                          <option key={task.id} value={task.id}>
                                            {task.title}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        type="number"
                                        value={timeHours}
                                        onChange={(e) => setTimeHours(parseFloat(e.target.value) || 0)}
                                        placeholder="Hours"
                                        min="0.1"
                                        step="0.1"
                                        style={{ 
                                          flex: "0 0 80px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      />
                                      <input
                                        type="date"
                                        value={timeDate}
                                        onChange={(e) => setTimeDate(e.target.value)}
                                        style={{ 
                                          flex: "0 0 120px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      />
                                      <input
                                        type="text"
                                        value={timeDescription}
                                        onChange={(e) => setTimeDescription(e.target.value)}
                                        placeholder="Description (optional)"
                                        style={{ 
                                          flex: "1 1 200px", 
                                          padding: "8px", 
                                          border: "1px solid #cbd5e0", 
                                          borderRadius: "4px",
                                          fontSize: "14px"
                                        }}
                                      />
                                      <button
                                        type="submit"
                                        style={{ 
                                          padding: "8px 16px", 
                                          background: "#38a169", 
                                          color: "white", 
                                          border: "none", 
                                          borderRadius: "4px",
                                          fontSize: "14px",
                                          cursor: "pointer",
                                          transition: "background-color 0.2s"
                                        }}
                                      >
                                        Log Time
                                      </button>
                                    </form>
                                  </div>
                             </div>
                             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                               {t.status !== TaskStatus.COMPLETED && (
                                 <button
                                   onClick={() => updateTaskStatus(t.id, TaskStatus.IN_PROGRESS)}
                                   style={{ 
                                     padding: "8px 16px", 
                                     background: "#63b3ed", 
                                     color: "white", 
                                     border: "none", 
                                     borderRadius: "4px",
                                     fontSize: "14px",
                                     cursor: "pointer",
                                     transition: "background-color 0.2s"
                                   }}
                                 >
                                   Start Work
                                 </button>
                               )}
                               {t.status === TaskStatus.IN_PROGRESS && (
                                 <button
                                   onClick={() => updateTaskStatus(t.id, TaskStatus.COMPLETED)}
                                   style={{ 
                                     padding: "8px 16px", 
                                     background: "#38a169", 
                                     color: "white", 
                                     border: "none", 
                                     borderRadius: "4px",
                                     fontSize: "14px",
                                     cursor: "pointer",
                                     transition: "background-color 0.2s"
                                   }}
                                 >
                                   Mark Complete
                                 </button>
                               )}
                             </div>
                           </div>
                         </li>
                       );
                     })}
                   </ul>
                 )
              )}
            </section>
          )}

          {activeSection === "leaves" && (
            <section className="pm-section">
              <h2>📅 My Leave Requests</h2>
              
              {/* Form Section */}
              <div style={{ 
                marginBottom: "24px", 
                padding: "20px", 
                border: "1px solid #e2e8f0", 
                borderRadius: "8px",
                backgroundColor: "#f8fafc"
              }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#2d3748" }}>Request New Leave</h3>
                {leaveError && <p style={{ color: "#e53e3e", marginBottom: "12px" }}>{leaveError}</p>}
                {leaveSuccess && <p style={{ color: "#38a169", marginBottom: "12px" }}>{leaveSuccess}</p>}
                
                <form onSubmit={handleCreateLeave} style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  <div>
                    <label htmlFor="startDate" style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#4a5568" }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      style={{ 
                        width: "100%", 
                        padding: "8px", 
                        border: "1px solid #cbd5e0", 
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#4a5568" }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      style={{ 
                        width: "100%", 
                        padding: "8px", 
                        border: "1px solid #cbd5e0", 
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                      min={newLeave.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reason" style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#4a5568" }}>
                      Reason
                    </label>
                    <input
                      type="text"
                      id="reason"
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      style={{ 
                        width: "100%", 
                        padding: "8px", 
                        border: "1px solid #cbd5e0", 
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    style={{ 
                      gridColumn: "1 / -1", 
                      padding: "10px 20px", 
                      background: "#38a169", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                  >
                    Submit Leave Request
                  </button>
                </form>
              </div>
              
              {/* Leave Requests List */}
              {leavesLoading ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Loading your leave requests...</p>
              ) : (
                myLeaveRequests.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                    You have no leave requests yet. Use the form above to submit a new request.
                  </p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {myLeaveRequests.map((leave) => (
                      <li key={leave.id} style={{ 
                        marginBottom: "16px", 
                        padding: "16px", 
                        border: "1px solid #e2e8f0", 
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#2d3748" }}>
                              {leave.days} day(s) leave
                            </p>
                            <p style={{ margin: "0 0 4px 0", color: "#4a5568" }}>
                              {leave.reason}
                            </p>
                            <p style={{ margin: "0", fontSize: "14px", color: "#718096" }}>
                              Status: 
                              <span style={{ 
                                textTransform: "capitalize", 
                                fontWeight: "600",
                                color: leave.status === RequestStatus.APPROVED ? "#38a169" :
                                     leave.status === RequestStatus.REJECTED || leave.status === RequestStatus.DENIED ? "#e53e3e" :
                                     "#dd6b20"
                              }}>
                                {leave.status}
                              </span>
                            </p>
                          </div>
                          {leave.status === RequestStatus.PENDING && (
                            <button
                              onClick={() => deleteLeaveRequest(leave.id)}
                              style={{ 
                                padding: "6px 12px", 
                                background: "#e53e3e", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "4px",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                              }}
                            >
                              Delete Request
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeveloperDashboard;