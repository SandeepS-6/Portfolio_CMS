import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Field } from "../components/ui";
import { AuthShell } from "../components/AuthShell";
import { authApi } from "../services/authApi";
import "./pages.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    setDevResetUrl("");

    try {
      const data = await authApi.forgotPassword(email.trim());
      setDone(true);
      if (data?.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send reset email");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell showSocials={false}>
      <form className="login__card login__card--auth form" onSubmit={handleSubmit}>
        <div className="auth-shell__icon" aria-hidden="true">
          <KeyRound size={20} strokeWidth={1.75} />
        </div>

        <div className="auth-shell__intro">
          <h1>Forgot password?</h1>
          <p className="page__lead">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {done ? (
          <>
            <p className="auth-shell__success">
              If that email is registered, a reset link has been sent. Check your inbox.
            </p>
            {devResetUrl ? (
              <p className="page__hint">
                Dev fallback link:{" "}
                <a href={devResetUrl}>{devResetUrl}</a>
              </p>
            ) : null}
          </>
        ) : (
          <>
            <Field
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              placeholder="Enter your email"
            />

            {error ? <p className="form__error">{error}</p> : null}

            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Reset password"}
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

export default ForgotPasswordPage;
