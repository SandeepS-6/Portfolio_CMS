import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Bare client — avoids interceptor recursion on refresh
const authClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

export const authApi = {
  login: (email, password) =>
    authClient.post("/api/auth/login", { email, password }).then((r) => r.data),
  forgotPassword: (email) =>
    authClient.post("/api/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) =>
    authClient
      .post("/api/auth/reset-password", { token, password })
      .then((r) => r.data),
  refresh: () => authClient.post("/api/auth/refresh").then((r) => r.data),
  logout: () => authClient.post("/api/auth/logout").then((r) => r.data),
  oauthProviders: () =>
    authClient.get("/api/auth/oauth/providers").then((r) => r.data),
  oauthStartUrl: (provider) => `${baseURL}/api/auth/oauth/${provider}`,
  me: (accessToken) =>
    authClient
      .get("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((r) => r.data),
};
