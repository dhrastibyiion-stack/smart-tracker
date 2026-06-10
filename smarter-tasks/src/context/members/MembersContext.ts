import { createContext } from "react";
import type { UserRole } from "../../config/constants";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  createdBy: string;
};

export type MembersContextValue = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: (createdBy?: string) => Promise<void>;
  createMember: (data: { name: string; email: string; role: UserRole; companyId: string; password: string; createdBy: string }) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
  updateMember: (id: number, data: { name: string; email: string; role: UserRole }) => Promise<void>;
};

export const MembersContext = createContext<MembersContextValue | undefined>(undefined);
