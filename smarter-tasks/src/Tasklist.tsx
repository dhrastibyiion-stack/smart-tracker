import Task from "./Task";
import type { TaskItem, TaskStatus } from "./type";

type Props = {
  tasks: TaskItem[];
  status: TaskStatus;
  onDeleteTask: (taskId: string, status: TaskStatus) => void;
  onToggleStatus: (taskId: string) => void;
  role: string;
};

const TaskListFC = (props: Props) => {
  const canDelete =
    props.role === "admin" || props.role === "projectManager";

  return (
    <ul>
      {props.tasks.map((task) => (
        <li key={task.id}>
          <Task
            taskId={task.id}
            title={task.title}
            dueDate={task.dueDate}
            description={task.description}
            onDelete={() => props.onDeleteTask(task.id, props.status)}
            onToggleStatus={() => props.onToggleStatus(task.id)}
            status={props.status}
            canDelete={canDelete}
          />
        </li>
      ))}
    </ul>
  );
};

const TaskList = TaskListFC;

export default TaskList;
