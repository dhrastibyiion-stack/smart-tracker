import type { TaskItem, TaskStatus } from "./type";

import TaskForm from "./Taskform";
import TaskList from "./Tasklist";
import CommentDialog from "./CommentDialog";

import { useLocalStorage } from "./hooks/useLocalStorage";
import { useAuth, type UserRole } from "./context/auth";

import "./TaskLayout.css";
import { Link } from "react-router-dom";

interface TaskAppState {
  pendingTasks: TaskItem[];
  doneTasks: TaskItem[];
}

const TaskAppFC = () => {
  const [taskAppState, setTaskAppState] = useLocalStorage<TaskAppState>(
    "tasks",
    {
      pendingTasks: [],
      doneTasks: [],
    }
  );

  const { role } = useAuth();

  const [activeCommentTaskId, setActiveCommentTaskId] = React.useState<string | null>(null);

  const canCreateTask = (r: UserRole) => {
    return r === "admin" || r === "projectManager";
  };

  const addTask = (task: Omit<TaskItem, "id">, status: TaskStatus) => {
    const taskWithId: TaskItem = {
      id: crypto.randomUUID(),
      ...task,
      comments: [],
    };

    setTaskAppState((state) => {
      if (status === "done") {
        return { ...state, doneTasks: [...state.doneTasks, taskWithId] };
      }
      return { ...state, pendingTasks: [...state.pendingTasks, taskWithId] };
    });
  };

  const deleteTask = (taskId: string, status: TaskStatus) => {
    setTaskAppState((state) => {
      if (status === "done") {
        return {
          ...state,
          doneTasks: state.doneTasks.filter((t) => t.id !== taskId),
        };
      }

      return {
        ...state,
        pendingTasks: state.pendingTasks.filter((t) => t.id !== taskId),
      };
    });
  };

  const updateTaskStatus = (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    setTaskAppState((state) => {
      const fromList = fromStatus === "pending" ? state.pendingTasks : state.doneTasks;
      const toList = toStatus === "pending" ? state.pendingTasks : state.doneTasks;
      const task = fromList.find((t) => t.id === taskId);
      if (!task) return state;

      const newFromList = fromList.filter((t) => t.id !== taskId);
      const newToList = [...toList, task];

      return {
        ...state,
        pendingTasks: toStatus === "pending" ? newToList : newFromList,
        doneTasks: toStatus === "done" ? newToList : newFromList,
      };
    });
  };

  const addComment = (taskId: string, commentText: string) => {
    setTaskAppState((state) => {
      const addTo = (tasks: TaskItem[]) =>
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, comments: [...(t.comments ?? []), commentText] }
            : t
        );

      return {
        ...state,
        pendingTasks: addTo(state.pendingTasks),
        doneTasks: addTo(state.doneTasks),
      };
    });
  };

  const activeTaskForComment =
    activeCommentTaskId !== null
      ? [
          ...taskAppState.pendingTasks,
          ...taskAppState.doneTasks,
        ].find((t) => t.id === activeCommentTaskId) ?? null
      : null;

  return (
    <div className="task-layout">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <div className="brand-badge">S</div>
            <div className="brand-title">
              <strong>Smarter Tasks</strong>
              <span>Graduation Final Year Project</span>
            </div>
          </div>

          <div className="nav-right">
            <span className="pill">Pending: {taskAppState.pendingTasks.length}</span>
            <span className="pill">Done: {taskAppState.doneTasks.length}</span>
            <Link className="nav-link" to="/trash">Trash</Link>
          </div>
        </div>
      </header>

      <main className="container-shell">
        <div className="page-hero">
          <h1>Task board</h1>
          <p>
            Add tasks to Pending or Done and keep everything organized in two columns.
          </p>
        </div>

        <section className="columns">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <strong>Pending</strong>
                <span>To do items</span>
              </div>
              <div className="pill">{taskAppState.pendingTasks.length}</div>
            </div>

            <div className="panel-body">
              {canCreateTask(role as UserRole) && (
                <TaskForm addTask={(task) => addTask(task, "pending")} />
              )}
              <div className="task-list">
                <TaskList
                  tasks={taskAppState.pendingTasks}
                  status="pending"
                  onDeleteTask={deleteTask}
                  onToggleStatus={(id) => updateTaskStatus(id, "pending", "done")}
                  onOpenComment={(id) => setActiveCommentTaskId(id)}
                  role={role as UserRole}
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <strong>Done</strong>
                <span>Completed items</span>
              </div>
              <div className="pill">{taskAppState.doneTasks.length}</div>
            </div>

            <div className="panel-body">
              {canCreateTask(role as UserRole) && (
                <TaskForm addTask={(task) => addTask(task, "done")} />
              )}
              <div className="task-list">
                <TaskList
                  tasks={taskAppState.doneTasks}
                  status="done"
                  onDeleteTask={deleteTask}
                  onToggleStatus={(id) => updateTaskStatus(id, "done", "pending")}
                  onOpenComment={(id) => setActiveCommentTaskId(id)}
                  role={role as UserRole}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {activeTaskForComment && (
        <CommentDialog
          task={activeTaskForComment}
          onClose={() => setActiveCommentTaskId(null)}
          onAddComment={(commentText) => {
            addComment(activeTaskForComment.id, commentText);
          }}
        />
      )}
    </div>
  );
};

const TaskApp = TaskAppFC;

export default TaskApp;
