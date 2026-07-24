import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/tokenStore";
import { authApi } from "./authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh()
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((err) => {
        clearAccessToken();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh auth endpoints themselves
    if (String(original.url || "").includes("/api/auth/")) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;

export const heroApi = {
  get: () => api.get("/api/hero").then((r) => r.data),
  update: (body) => api.put("/api/hero", body).then((r) => r.data),
};

export const skillsApi = {
  list: () => api.get("/api/skills").then((r) => r.data),
  create: (body) => api.post("/api/skills", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/skills/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/skills/${id}`).then((r) => r.data),
};

export const projectsApi = {
  list: () => api.get("/api/projects").then((r) => r.data),
  create: (body) => api.post("/api/projects", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/projects/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/projects/${id}`).then((r) => r.data),
};

export const projectsSectionApi = {
  get: () => api.get("/api/projects-section").then((r) => r.data),
  update: (body) => api.put("/api/projects-section", body).then((r) => r.data),
};

export const experienceApi = {
  list: () => api.get("/api/experience").then((r) => r.data),
  create: (body) => api.post("/api/experience", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/experience/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/experience/${id}`).then((r) => r.data),
};

export const educationApi = {
  list: () => api.get("/api/education").then((r) => r.data),
  create: (body) => api.post("/api/education", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/education/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/education/${id}`).then((r) => r.data),
};

export const certificatesApi = {
  list: () => api.get("/api/certificates").then((r) => r.data),
  create: (body) => api.post("/api/certificates", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/certificates/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/certificates/${id}`).then((r) => r.data),
};

export const socialLinksApi = {
  list: () => api.get("/api/social-links").then((r) => r.data),
  create: (body) => api.post("/api/social-links", body).then((r) => r.data),
  update: (id, body) => api.put(`/api/social-links/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/social-links/${id}`).then((r) => r.data),
};

export const contactInfoApi = {
  get: () => api.get("/api/contact-info").then((r) => r.data),
  update: (body) => api.put("/api/contact-info", body).then((r) => r.data),
};

export const footerApi = {
  get: () => api.get("/api/footer").then((r) => r.data),
  update: (body) => api.put("/api/footer", body).then((r) => r.data),
};

export const settingsApi = {
  get: () => api.get("/api/settings").then((r) => r.data),
  update: (body) => api.put("/api/settings", body).then((r) => r.data),
};

export const messagesApi = {
  list: () => api.get("/api/messages").then((r) => r.data),
  markRead: (id) => api.patch(`/api/messages/${id}`, { isRead: true }).then((r) => r.data),
  remove: (id) => api.delete(`/api/messages/${id}`).then((r) => r.data),
};

export const meetingApi = {
  getSettings: () => api.get("/api/meeting").then((r) => r.data),
  updateSettings: (body) => api.put("/api/meeting", body).then((r) => r.data),
  listBookings: () => api.get("/api/meeting/bookings").then((r) => r.data),
  cancelBooking: (id) =>
    api.patch(`/api/meeting/bookings/${id}`).then((r) => r.data),
  removeBooking: (id) =>
    api.delete(`/api/meeting/bookings/${id}`).then((r) => r.data),
};
