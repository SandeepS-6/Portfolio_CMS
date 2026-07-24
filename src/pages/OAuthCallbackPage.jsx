import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { AuthShell } from "../components/AuthShell";
import "./pages.css";

function OAuthCallbackPage() {
  const { status, completeOAuthSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    completeOAuthSession()
      .then(() => {
        if (alive) navigate("/", { replace: true });
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.response?.data?.error || err.message || "Sign-in failed");
      });

    return () => {
      alive = false;
    };
  }, [completeOAuthSession, navigate]);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthShell showSocials={false}>
      <div className="login__card login__card--auth form">
        <h1>{error ? "Sign-in failed" : "Finishing sign-in"}</h1>
        <p className="page__lead">
          {error
            ? error
            : "Confirming your Google or GitHub session…"}
        </p>
        {error ? (
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to sign in
          </button>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default OAuthCallbackPage;
