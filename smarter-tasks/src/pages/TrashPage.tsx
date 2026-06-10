import { useTasks } from "../context/tasks";
import { Link } from "react-router-dom";

const TrashPage = () => {
  const { getDeletedTasks, restoreTask } = useTasks();

  const handleRestore = async (id: number) => {
    await restoreTask(id);
  };

  const deletedTasks = getDeletedTasks();

  return (
    <div className="task-layout">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <Link to="/" className="brand-link">
              <div className="brand-badge">S</div>
              <div className="brand-title">
                <strong>Smarter Tasks</strong>
                <span>Graduation Final Year Project</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-shell">
        <div className="page-hero">
          <h1>Trash</h1>
          <p>Deleted tasks are listed below. You can restore them.</p>
        </div>

        {deletedTasks.length === 0 && (
          <p>No deleted tasks.</p>
        )}

        <ul>
          {deletedTasks.map((task) => (
            <li key={task.id} className="trash-item">
              <div>
                <strong>{task.title}</strong>
                <span className="task-meta">Status: {task.status}</span>
              </div>
              <button
                type="button"
                className="task-btn save"
                onClick={() => handleRestore(task.id)}
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default TrashPage;
