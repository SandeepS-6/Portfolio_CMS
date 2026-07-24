import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "booting") {
    return (
      <div className="auth-boot">
        <div className="auth-boot__spinner" aria-hidden="true" />
        <p>Checking session…</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
