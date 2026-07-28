import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import HeroPage from "./pages/HeroPage";
import SkillsPage from "./pages/SkillsPage";
import ResourcePage from "./pages/ResourcePage";
import MessagesPage from "./pages/MessagesPage";
import MeetingSettingsPage from "./pages/MeetingSettingsPage";
import MeetingBookingsPage from "./pages/MeetingBookingsPage";
import { ContactInfoPage, FooterPage, SettingsPage } from "./pages/SingletonPages";
import {
  projectsApi,
  experienceApi,
  educationApi,
  certificatesApi,
  socialLinksApi,
} from "./services/api";
import ProjectsSectionPage from "./pages/ProjectsSectionPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="hero" element={<HeroPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route
                path="projects"
                element={
                  <ResourcePage
                    title="Projects"
                    api={projectsApi}
                    required={["title", "slug"]}
                    fields={[
                      { name: "title" },
                      { name: "slug", placeholder: "project-atlas" },
                      { name: "summary", type: "textarea" },
                      { name: "description", type: "textarea" },
                      { name: "coverImage", placeholder: "https://..." },
                      { name: "coverAlt" },
                      { name: "liveUrl" },
                      { name: "repoUrl" },
                      { name: "caseStudyUrl" },
                      { name: "docsUrl" },
                      {
                        name: "techStack",
                        type: "techStack",
                        defaultValue: "[]",
                        hint: "Type a name (React, Node…) — icon resolves automatically. Edit the slug to override.",
                      },
                      {
                        name: "features",
                        type: "json",
                        placeholder: '["Feature one"]',
                        defaultValue: "[]",
                      },
                      { name: "category", placeholder: "Frontend" },
                      {
                        name: "kinds",
                        type: "json",
                        placeholder: '["featured","production"]',
                        defaultValue: "[]",
                      },
                      { name: "role" },
                      { name: "duration" },
                      { name: "fromLabel", placeholder: "Jan 2026" },
                      { name: "toLabel", placeholder: "Present" },
                      { name: "progress", type: "number" },
                      { name: "sortDate", placeholder: "2026-06-01" },
                      {
                        name: "relatedSlugs",
                        type: "json",
                        placeholder: '["project-pulse"]',
                        defaultValue: "[]",
                      },
                      {
                        name: "caseStudy",
                        type: "json",
                        placeholder: '{"overview":"..."}',
                        defaultValue: "{}",
                      },
                      {
                        name: "gallery",
                        type: "json",
                        placeholder: '[{"src":"...","alt":"..."}]',
                        defaultValue: "[]",
                      },
                      { name: "readingTime", placeholder: "6 min" },
                      { name: "seoTitle" },
                      { name: "seoDescription", type: "textarea" },
                      { name: "displayOrder", type: "number", defaultValue: 0 },
                      { name: "isFeatured", type: "checkbox", defaultValue: false },
                      { name: "isVisible", type: "checkbox", defaultValue: true },
                    ]}
                  />
                }
              />
              <Route path="projects-section" element={<ProjectsSectionPage />} />
              <Route
                path="experience"
                element={
                  <ResourcePage
                    title="Experience"
                    api={experienceApi}
                    required={["company", "role", "startDate"]}
                    fields={[
                      { name: "company" },
                      { name: "role" },
                      { name: "location" },
                      { name: "description", type: "textarea" },
                      {
                        name: "startDate",
                        placeholder: "2024-01-01T00:00:00.000Z",
                      },
                      { name: "endDate" },
                      { name: "displayOrder", type: "number", defaultValue: 0 },
                    ]}
                  />
                }
              />
              <Route
                path="education"
                element={
                  <ResourcePage
                    title="Education"
                    api={educationApi}
                    required={["school"]}
                    fields={[
                      { name: "school" },
                      { name: "degree" },
                      { name: "field" },
                      { name: "location" },
                      { name: "description", type: "textarea" },
                      { name: "displayOrder", type: "number", defaultValue: 0 },
                    ]}
                  />
                }
              />
              <Route
                path="certificates"
                element={
                  <ResourcePage
                    title="Certificates"
                    api={certificatesApi}
                    required={["title"]}
                    fields={[
                      { name: "title" },
                      { name: "issuer" },
                      { name: "credentialUrl" },
                      { name: "displayOrder", type: "number", defaultValue: 0 },
                    ]}
                  />
                }
              />
              <Route path="social-links" element={
                  <ResourcePage
                    title="Social Links"
                    api={socialLinksApi}
                    required={["platform", "url"]}
                    fields={[
                      { name: "platform" },
                      { name: "label" },
                      { name: "url" },
                      { name: "icon" },
                      { name: "displayOrder", type: "number", defaultValue: 0 },
                    ]}
                  />
                }
              />
              <Route path="footer" element={<FooterPage />} />
              <Route path="contact-info" element={<ContactInfoPage />} />
              <Route path="meeting" element={<MeetingSettingsPage />} />
              <Route path="meeting-bookings" element={<MeetingBookingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
