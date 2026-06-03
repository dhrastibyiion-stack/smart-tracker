import type { Comment } from "./CommentsContext";

type State = {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: Comment[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_COMMENT_SUCCESS"; payload: number };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "API_CALL_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "API_CALL_END":
      return {
        ...state,
        isLoading: false,
        comments: action.payload,
        error: null,
      };
    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "REMOVE_COMMENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        comments: state.comments.filter((c) => c.id !== action.payload),
        error: null,
      };
    default:
      return state;
  }
};

export type { Comment } from "./CommentsContext";