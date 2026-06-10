import type { Member } from "./MembersContext";

type State = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
};

export type Action =
  | { type: "API_CALL_START" }
  | { type: "API_CALL_END"; payload: Member[] }
  | { type: "API_CALL_ERROR"; payload: string }
  | { type: "REMOVE_MEMBER_SUCCESS"; payload: number }
  | { type: "UPDATE_MEMBER_SUCCESS"; payload: Member };

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
        members: action.payload,
        error: null,
      };
    case "API_CALL_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "REMOVE_MEMBER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        members: state.members.filter((m) => m.id !== action.payload),
        error: null,
      };
    case "UPDATE_MEMBER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        members: state.members.map((m) => m.id === action.payload.id ? action.payload : m),
        error: null,
      };
    default:
      return state;
  }
};
