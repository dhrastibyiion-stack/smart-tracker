import { useCallback, useEffect, useMemo, useReducer } from "react";

import { CommentsContext } from "./CommentsContext";
import { reducer, type Action } from "./reducer";
import {
  addCommentRequest,
  deleteCommentRequest,
  refreshComments,
} from "./actions";

import type { CommentsContextValue } from "./CommentsContext";

type Dispatch = (action: Action) => void;

export const CommentsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    comments: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshComments({ dispatch });
  }, [dispatch]);

  const addComment = useCallback(
    async (data: {
      taskId: number;
      authorId: number;
      authorName: string;
      content: string;
    }) => {
      await addCommentRequest({
        data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const deleteComment = useCallback(
    async (id: number) => {
      await deleteCommentRequest({
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<CommentsContextValue>(
    () => ({
      comments: state.comments,
      isLoading: state.isLoading,
      error: state.error,
      refreshComments: refresh,
      addComment,
      deleteComment,
    }),
    [addComment, deleteComment, refresh, state.error, state.isLoading, state.comments]
  );

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
};