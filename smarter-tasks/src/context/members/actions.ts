import type { Action } from "./reducer";
import type { Member } from "./MembersContext";
import { STORAGE_KEYS } from "../../config/constants";

type Dispatch = (action: Action) => void;

export const refreshMembers = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = stored ? JSON.parse(stored) : [];

    dispatch({ type: "API_CALL_END", payload: members });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createMemberRequest = async (opts: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { name, email, role, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = stored ? JSON.parse(stored) : [];

    const newMember: Member = {
      id: Date.now(),
      name,
      email,
      role,
    };

    const updatedMembers = [...members, newMember];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedMembers));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const deleteMemberRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    let members: Member[] = stored ? JSON.parse(stored) : [];

    members = members.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    dispatch({ type: "REMOVE_MEMBER_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};
