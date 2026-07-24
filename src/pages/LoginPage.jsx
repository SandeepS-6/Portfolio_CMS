import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Field, PasswordField } from "../components/ui";
import { AuthShell } from "../components/AuthShell";
import "./pages.css";

const REMEMBER_KEY = "cms_remember_email";

function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)));
  const [error, setError] = useState(() => searchParams.get("error") || "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!remember) localStorage.removeItem(REMEMBER_KEY);
  }, [remember]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) setError(oauthError);
  }, [searchParams]);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      await login(email.trim(), password);
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell>
      <form className="login__card form" onSubmit={handleSubmit}>
        <Field
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          placeholder="you@example.com"
        />

        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="auth-shell__row">
          <label className="auth-shell__check">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="auth-shell__check-box" aria-hidden="true" />
            <span>Remember me</span>
          </label>
          <Link className="auth-shell__link" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {error ? <p className="form__error">{error}</p> : null}

        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
