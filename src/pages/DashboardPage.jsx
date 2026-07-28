import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Briefcase,
  Calendar,
  CalendarCheck,
  ExternalLink,
  FolderKanban,
  Footprints,
  GraduationCap,
  Inbox,
  Layers,
  ListTodo,
  PanelsTopLeft,
  Phone,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  messagesApi,
  meetingApi,
  projectsApi,
  skillsApi,
} from "../services/api";
import { PageHeader, Panel } from "../components/ui";
import "./pages.css";

const modules = [
  { to: "/hero", label: "Hero", note: "Identity and opening pitch", icon: Sparkles, group: "Content" },
  { to: "/what-i-do", label: "What I Do", note: "Capability cards and process", icon: ListTodo, group: "Content" },
  { to: "/skills", label: "Skill Badges", note: "Floating hero badges", icon: Layers, group: "Content" },
  { to: "/skills-section", label: "Skills Section", note: "Technologies I Work With", icon: PanelsTopLeft, group: "Content" },
  { to: "/projects", label: "Projects", note: "Selected work entries", icon: FolderKanban, group: "Content" },
  { to: "/experience", label: "Experience", note: "Roles and timeline", icon: Briefcase, group: "Content" },
  { to: "/education", label: "Education", note: "Schools and degrees", icon: GraduationCap, group: "Content" },
  { to: "/certificates", label: "Certificates", note: "Credentials", icon: Award, group: "Content" },
  { to: "/social-links", label: "Social Links", note: "Shown in the contact ending", icon: Share2, group: "Site" },
  { to: "/footer", label: "Footer", note: "Contact ending copy + CTA", icon: Footprints, group: "Site" },
  { to: "/contact-info", label: "Contact Info", note: "Raw reachability fields", icon: Phone, group: "Site" },
  { to: "/meeting", label: "Meeting Settings", note: "Let's Talk scheduler config", icon: Calendar, group: "Engage" },
  { to: "/meeting-bookings", label: "Meeting Bookings", note: "Booked calls inbox", icon: CalendarCheck, group: "Engage" },
  { to: "/messages", label: "Messages", note: "Inbox from the portfolio", icon: Inbox, group: "Engage" },
  { to: "/settings", label: "Settings", note: "Site-wide metadata", icon: Settings, group: "Site" },
];

function DashboardPage() {
  const [stats, setStats] = useState({
    projects: null,
    skills: null,
    messages: null,
    bookings: null,
  });

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      projectsApi.list(),
      skillsApi.list(),
      messagesApi.list(),
      meetingApi.listBookings(),
    ]).then(([projects, skills, messages, bookings]) => {
      if (!alive) return;
      setStats({
        projects: projects.status === "fulfilled" ? projects.value.length : "—",
        skills: skills.status === "fulfilled" ? skills.value.length : "—",
        messages: messages.status === "fulfilled" ? messages.value.length : "—",
        bookings: bookings.status === "fulfilled" ? bookings.value.length : "—",
      });
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        lead="Edit portfolio content through the API. Frontend and CMS never talk to PostgreSQL directly."
        actions={
          <a
            className="btn btn--ghost btn--sm"
            href={`${import.meta.env.VITE_API_URL }/api/docs`}
            target="_blank"
            rel="noreferrer"
          >
            API docs
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
      />

      <div className="dash-grid">
        <article className="stat-card">
          <p className="stat-card__label">Projects</p>
          <p className="stat-card__value">{stats.projects ?? "…"}</p>
          <p className="stat-card__note">Case studies in the CMS</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Skills</p>
          <p className="stat-card__value">{stats.skills ?? "…"}</p>
          <p className="stat-card__note">Hero floating badges</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Messages</p>
          <p className="stat-card__value">{stats.messages ?? "…"}</p>
          <p className="stat-card__note">Contact form inbox</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Bookings</p>
          <p className="stat-card__value">{stats.bookings ?? "…"}</p>
          <p className="stat-card__note">Scheduled meetings</p>
        </article>
      </div>

      <Panel title="Content modules" meta="Jump into any section of the portfolio CMS">
        <div className="module-grid">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="module-card">
                <span className="module-card__icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.note}</em>
                </span>
                <span className="module-card__cta">Open</span>
              </Link>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

export default DashboardPage;
