import type { Action } from "./reducer";
import type { Member } from "./MembersContext";
import { STORAGE_KEYS, UserRole } from "../../config/constants";

type Dispatch = (action: Action) => void;

export const refreshMembers = async (opts: {
  dispatch: Dispatch;
  createdBy?: string | null;
}) => {
  const { dispatch, createdBy } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    let members: Member[] = stored ? JSON.parse(stored) : [];

    if (createdBy) {
      members = members.filter((m) => m.createdBy === createdBy);
    }

    dispatch({ type: "API_CALL_END", payload: members });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const createMemberRequest = async (opts: {
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  password: string;
  createdBy: string;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { name, email, role, companyId, password, createdBy, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = stored ? JSON.parse(stored) : [];

    const newMember: Member = {
      id: Date.now(),
      name,
      email,
      role,
      companyId,
      createdBy,
    };

    const updatedMembers = [...members, newMember];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedMembers));

    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userExists = users.some((u: Record<string, unknown>) => u.email === email);
    if (!userExists) {
      users.push({
        email,
        name,
        role,
        companyId,
        password,
        passwordSet: true,
      });
      localStorage.setItem("registeredUsers", JSON.stringify(users));
    }

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

export const updateMemberRequest = async (opts: {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, name, email, role, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const members: Member[] = stored ? JSON.parse(stored) : [];

    const updatedMembers = members.map((m) =>
      m.id === id ? { ...m, name, email, role } : m
    );
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedMembers));

    const updatedMember = updatedMembers.find((m) => m.id === id)!;
    dispatch({ type: "UPDATE_MEMBER_SUCCESS", payload: updatedMember });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};
