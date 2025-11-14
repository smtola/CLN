import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getUser } from "../authStorage";
import type { DecodeToken } from "../types/auth";
import Logo from "/logo.png";

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

  // ⏳ While loading, show a loader with company logo
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <img
              src={Logo}
              alt="CLN Cambodia Logo"
              className="w-32 h-20 md:w-40 md:h-24 object-contain animate-pulse"
            />
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-[#4fb748] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#4fb748] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#4fb748] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

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
