import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { LoadingState } from "@/components/State";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingState title="Loading account" description="Fetching your profile details." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "RIDER") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
