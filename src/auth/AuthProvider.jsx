import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "../services/authApi";
import { clearAccessToken, setAccessToken } from "./tokenStore";

const AuthContext = createContext(null);

function oauthAccessTokenFromHash() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hash.get("access_token");
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("booting"); // booting | authenticated | anonymous
  const [user, setUser] = useState(null);
  const bootStarted = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    // OAuth callback carries the token in the hash — let that page finish login.
    if (
      window.location.pathname.includes("/oauth/callback") &&
      oauthAccessTokenFromHash()
    ) {
      return;
    }

    authApi
      .refresh()
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        // Don't wipe a session that OAuth just established
        if (statusRef.current === "authenticated") return;
        clearAccessToken();
        setUser(null);
        setStatus("anonymous");
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const completeOAuthSession = useCallback(async () => {
    const accessToken = oauthAccessTokenFromHash();

    if (accessToken) {
      const me = await authApi.me(accessToken);
      setAccessToken(accessToken);
      setUser(me);
      setStatus("authenticated");
      window.history.replaceState(null, "", window.location.pathname);
      return me;
    }

    const data = await authApi.refresh();
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // clear local session even if network fails
    }
    clearAccessToken();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      login,
      completeOAuthSession,
      logout,
    }),
    [status, user, login, completeOAuthSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
