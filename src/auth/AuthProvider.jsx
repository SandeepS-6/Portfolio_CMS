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

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("booting"); // booting | authenticated | anonymous
  const [user, setUser] = useState(null);
  const bootStarted = useRef(false);

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    authApi
      .refresh()
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch(() => {
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
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");

    if (accessToken) {
      const user = await authApi.me(accessToken);
      setAccessToken(accessToken);
      setUser(user);
      setStatus("authenticated");
      window.history.replaceState(null, "", window.location.pathname);
      return user;
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
