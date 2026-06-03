import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "./context/auth";

interface Props {
  roles?: UserRole[];
}

export default function ProtectedRoute({ roles }: Props) {
  const { token, role } = useAuth();
  if (!token) {
    return <Navigate to="/signin" />;
  }
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};