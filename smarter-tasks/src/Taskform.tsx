import React from "react";
import type { TaskItem } from "./type";

const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "#ffffff",
  color: "#000000",
  boxSizing: "border-box",
};

type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
};

type TaskFormProps = {
  addTask: (task: Omit<TaskItem, "id">) => void;
};

const TaskFormFC = (props: TaskFormProps) => {
  const [formState, setFormState] = React.useState<TaskFormState>({
    title: "",
    description: "",
    dueDate: "",
  });


  const titleChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormState({ ...formState, title: event.target.value });
  };

  const descriptionChanged: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setFormState({ ...formState, description: event.target.value });
  };

  const dueDateChanged: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormState({ ...formState, dueDate: event.target.value });
  };

  const addTask: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();


    if (formState.title.trim().length === 0 || formState.dueDate.trim().length === 0) {
      return;
    }

    props.addTask(formState);
    setFormState({ title: "", description: "", dueDate: "" });
  };

  return (
    <form
      onSubmit={addTask}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <input
        style={fieldBase}
        id="todoTitle"
        placeholder="Task title"
        type="text"
        value={formState.title}
        onChange={titleChanged}
      />

      <input
        style={fieldBase}
        id="todoDescription"
        placeholder="Short description"
        type="text"
        value={formState.description}
        onChange={descriptionChanged}
      />

      <input
        style={fieldBase}
        id="todoDueDate"
        type="date"
        value={formState.dueDate}
        onChange={dueDateChanged}
      />

      <button
        id="addTaskButton"
        type="submit"
        style={{
          padding: "11px 14px",
          borderRadius: 12,
          border: "1px solid var(--accent-border)",
          background: "var(--accent-bg)",
          color: "var(--accent)",
          fontWeight: 800,
          cursor: "pointer",
          transition: "transform 0.05s ease, filter 0.2s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.99)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Add item
      </button>
    </form>
  );
};

const TaskForm = TaskFormFC;

export default TaskForm;


