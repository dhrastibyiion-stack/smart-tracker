import React from "react";
import { useParams } from "react-router-dom";

import { useLocalStorage } from "../hooks/useLocalStorage";
import type { TaskItem } from "../type";

type TaskDetailsPageParams = Record<string, string | undefined> & {
  id: string;
};

interface TaskAppState {
  pendingTasks: TaskItem[];
  doneTasks: TaskItem[];
}

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<TaskDetailsPageParams>();




  const [taskAppState] = useLocalStorage<TaskAppState>("tasks", {
    pendingTasks: [],
    doneTasks: [],
  });

  const allTasks = [...taskAppState.pendingTasks, ...taskAppState.doneTasks];
  const task = allTasks.find((t) => t.id === id);

  return (
    <div className="bg-white shadow-md rounded-md p-4 m-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{task?.title}</h3>
      </div>
      <p className="text-gray-600">{task?.description}</p>
      <p className="text-gray-600">{task?.dueDate}</p>
    </div>
  );
};

export default TaskDetailsPage;

