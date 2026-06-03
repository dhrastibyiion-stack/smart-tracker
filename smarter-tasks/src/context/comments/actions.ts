import type { Action, Comment } from "./reducer";
type Dispatch = (action: Action) => void;

export const refreshComments = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    // We'll store comments in localStorage with their own key
    const commentsStored = localStorage.getItem("comments");
    const comments: Comment[] = commentsStored ? JSON.parse(commentsStored) : [];

    dispatch({ type: "API_CALL_END", payload: comments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const addCommentRequest = async (opts: {
  data: {
    taskId: number;
    authorId: number;
    authorName: string;
    content: string;
  };
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { data, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const commentsStored = localStorage.getItem("comments");
    const comments: Comment[] = commentsStored ? JSON.parse(commentsStored) : [];

    const newComment: Comment = {
      id: Date.now(),
      taskId: data.taskId,
      authorId: data.authorId,
      authorName: data.authorName,
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    localStorage.setItem("comments", JSON.stringify(updatedComments));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const deleteCommentRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const commentsStored = localStorage.getItem("comments");
    let comments: Comment[] = commentsStored ? JSON.parse(commentsStored) : [];

    comments = comments.filter((c) => c.id !== id);
    localStorage.setItem("comments", JSON.stringify(comments));

    dispatch({ type: "REMOVE_COMMENT_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};