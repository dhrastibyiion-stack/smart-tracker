import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/signin" replace />;
};

export default Logout;
