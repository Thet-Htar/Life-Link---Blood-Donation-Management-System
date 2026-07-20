import type { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authState";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  const token = useAuthStore((state) => state.accessToken);

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
};
