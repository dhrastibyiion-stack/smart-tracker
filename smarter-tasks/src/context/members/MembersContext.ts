import { createContext } from "react";
import type { UserRole } from "../../config/constants";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type MembersContextValue = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: () => Promise<void>;
  createMember: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
};

export const MembersContext = createContext<MembersContextValue | undefined>(undefined);
