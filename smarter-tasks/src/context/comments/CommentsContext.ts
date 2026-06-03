import { createContext } from "react";

export type Comment = {
  id: number;
  taskId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
};

export type CommentsContextValue = {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  refreshComments: () => Promise<void>;
  addComment: (data: {
    taskId: number;
    authorId: number;
    authorName: string;
    content: string;
  }) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
};

export const CommentsContext = createContext<CommentsContextValue | undefined>(undefined);