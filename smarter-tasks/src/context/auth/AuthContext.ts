import { createContext } from "react";

export type UserRole = "admin" | "projectManager" | "dev";

export type AuthContextValue = {
  token: string | null;
  user: { name: string; username: string; email?: string; companyId?: string } | null;
  role: UserRole | null;
  login: (params: {
    token: string;
    user: { name: string; username: string; email?: string; companyId?: string };
    role: UserRole;
  }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
});