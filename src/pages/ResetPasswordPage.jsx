import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PasswordField } from "../components/ui";
import { AuthShell } from "../components/AuthShell";
import { authApi } from "../services/authApi";
import "./pages.css";

function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to reset password");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell showSocials={false}>
      <form className="login__card login__card--auth form" onSubmit={handleSubmit}>
        <div className="auth-shell__icon" aria-hidden="true">
          <LockKeyhole size={20} strokeWidth={1.75} />
        </div>

        <div className="auth-shell__intro">
          <h1>Set new password</h1>
          <p className="page__lead">
            Choose a new password for your CMS account.
          </p>
        </div>

        {done ? (
          <p className="auth-shell__success">
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <>
            <PasswordField
              label="New password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordField
              label="Confirm password"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />

            {error ? <p className="form__error">{error}</p> : null}

            <button className="btn" type="submit" disabled={pending || !token}>
              {pending ? "Updating…" : "Reset password"}
            </button>
          </>
        )}

        <Link className="auth-shell__back" to="/login">
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back to log in
        </Link>
      </form>
    </AuthShell>
  );
}

export default ResetPasswordPage;
