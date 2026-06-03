import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { UserRole } from "./AuthContext";
import { normalizeRole } from "../../config/constants";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<{ name: string; username: string } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem("userRole");
    return stored ? normalizeRole(stored) : null;
  });

  const login = async (params: { token: string; user: { name: string; username: string }; role: UserRole }) => {
    const normalizedRole = normalizeRole(params.role);
    setToken(params.token);
    setUser(params.user);
    setRole(normalizedRole);
    localStorage.setItem("authToken", params.token);
    localStorage.setItem("user", JSON.stringify(params.user));
    localStorage.setItem("userRole", normalizedRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  };

  const value = { token, user, role, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
export { useAuth } from "./useAuth";