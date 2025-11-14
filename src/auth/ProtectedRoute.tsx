import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getUser } from "../authStorage";
import type { DecodeToken } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactElement;
  role?: "admin" | "user";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const [user, setUser] = useState<DecodeToken>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userData = await getUser();
      setUser(userData);
      setLoading(false);
    })();
  }, []);

  // ⏳ While loading, show a loader or nothing
  if (loading) return <div>Loading...</div>;

  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
