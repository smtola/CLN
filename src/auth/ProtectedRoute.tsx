import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

interface ProtectedRouteProps {
  children: ReactElement;
  role?: "admin" | "user";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // e.g. "admin" or "user"

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
