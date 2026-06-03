import "./TaskCard.css";
import { Link } from "react-router-dom";

type TaskProp = {
  title: string;
  dueDate: string;
  description: string;
  taskId: string;
  onDelete: () => void;
  onToggleStatus: () => void;
  status: "pending" | "done";
  canDelete: boolean;
};

const TaskFC = (props: TaskProp) => {
  return (
    <div className="TaskItem">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h3>
          <Link to={`/tasks/${props.taskId}`}>{props.title}</Link>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>
            {" "}
            ({props.dueDate})
          </span>
        </h3>
      </div>
      <p>{props.description}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={props.onToggleStatus}
          className="toggleStatusButton"
        >
          {props.status === "pending" ? "Mark as Done" : "Mark as Pending"}
        </button>
        {props.canDelete && (
          <button
            type="button"
            className="deleteTaskButton"
            onClick={props.onDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const Task = TaskFC;

export default Task;





