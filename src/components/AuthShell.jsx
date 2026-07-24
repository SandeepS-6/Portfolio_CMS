import { useEffect, useState } from "react";
import { InteractiveGridPattern } from "./InteractiveGridPattern";
import { authApi } from "../services/authApi";
import "./AuthShell.css";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.486 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.467-1.11-1.467-.908-.621.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.952 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.944.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.486 17.523 2 12 2z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const AUTH_PROVIDERS = [
  { id: "github", label: "GitHub", Icon: GitHubIcon },
  { id: "google", label: "Google", Icon: GoogleIcon },
];

const CELL = 36;

const MARQUEE_TOP = [
  "Portfolio CMS",
  "Edit live content",
  "Ship with confidence",
  "Projects · Skills · Hero",
  "Secure workspace",
];

const MARQUEE_BOTTOM = [
  "Clarity over clutter",
  "Performance first",
  "Product sense",
  "Clean code",
  "Trusted interfaces",
];

function Marquee({ items, direction = "rtl", className = "" }) {
  const line = items.join("  ·  ");
  const track = `${line}  ·  ${line}  ·  `;

  return (
    <div
      className={`auth-shell__marquee auth-shell__marquee--${direction}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <div className="auth-shell__marquee-track">
        <span>{track}</span>
        <span>{track}</span>
      </div>
    </div>
  );
}

function gridSquares() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  const h = typeof window !== "undefined" ? window.innerHeight : 800;
  // Oversized so the skewed plane still fills the whole viewport
  return [
    Math.min(52, Math.ceil((w * 1.35) / CELL) + 2),
    Math.min(44, Math.ceil((h * 1.45) / CELL) + 2),
  ];
}

export function AuthShell({ children, showSocials = true }) {
  const [squares, setSquares] = useState(() => gridSquares());
  const [providers, setProviders] = useState({ google: false, github: false });
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    function onResize() {
      setSquares(gridSquares());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!showSocials) return undefined;
    let alive = true;
    authApi
      .oauthProviders()
      .then((data) => {
        if (alive) setProviders(data);
      })
      .catch(() => {
        if (alive) setProviders({ google: false, github: false });
      });
    return () => {
      alive = false;
    };
  }, [showSocials]);

  function startOAuth(provider) {
    setOauthError("");
    if (!providers[provider]) {
      setOauthError(
        `${provider === "google" ? "Google" : "GitHub"} sign-in is not configured on the server.`,
      );
      return;
    }
    window.location.assign(authApi.oauthStartUrl(provider));
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell__art" aria-hidden="true">
        <InteractiveGridPattern
          width={CELL}
          height={CELL}
          squares={squares}
        />
      </div>

      <div className="auth-shell__marquees" aria-hidden="true">
        <Marquee items={MARQUEE_TOP} direction="rtl" className="auth-shell__marquee--edge-top" />
        <Marquee items={MARQUEE_BOTTOM} direction="ltr" className="auth-shell__marquee--edge-bottom" />
      </div>

      <div className="auth-shell__content">
        {children}

        {showSocials ? (
          <div className="auth-shell__socials">
            <div className="auth-shell__or" role="separator" aria-label="Or">
              <span className="auth-shell__or-line" />
              <span className="auth-shell__or-mark" aria-hidden="true" />
              <span className="auth-shell__or-text">OR</span>
              <span className="auth-shell__or-mark" aria-hidden="true" />
              <span className="auth-shell__or-line" />
            </div>
            {oauthError ? <p className="form__error">{oauthError}</p> : null}
            <ul className="auth-shell__social-list">
              {AUTH_PROVIDERS.map(({ id, label, Icon }) => {
                const enabled = Boolean(providers[id]);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="auth-shell__social-link"
                      aria-label={`Continue with ${label}`}
                      title={
                        enabled
                          ? label
                          : `${label} is not configured`
                      }
                      disabled={!enabled}
                      onClick={() => startOAuth(id)}
                    >
                      <Icon />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
