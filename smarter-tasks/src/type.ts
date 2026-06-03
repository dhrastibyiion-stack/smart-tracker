export type TaskStatus = "pending" | "done";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}


