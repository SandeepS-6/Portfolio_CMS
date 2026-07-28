import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Award,
  Briefcase,
  Calendar,
  CalendarCheck,
  Footprints,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Layers,
  ListTodo,
  PanelsTopLeft,
  LogOut,
  Menu,
  Phone,
  Settings,
  Share2,
  Sparkles,
  FolderKanban,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import "./AdminLayout.css";

const groups = [
  {
    label: "Overview",
    links: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Content",
    links: [
      { to: "/hero", label: "Hero", icon: Sparkles },
      { to: "/what-i-do", label: "What I Do", icon: ListTodo },
      { to: "/skills", label: "Skill Badges", icon: Layers },
      { to: "/skills-section", label: "Skills Section", icon: PanelsTopLeft },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/projects-section", label: "Projects Section", icon: PanelsTopLeft },
      { to: "/experience", label: "Experience", icon: Briefcase },
      { to: "/education", label: "Education", icon: GraduationCap },
      { to: "/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "Site",
    links: [
      { to: "/social-links", label: "Social Links", icon: Share2 },
      { to: "/footer", label: "Footer", icon: Footprints },
      { to: "/contact-info", label: "Contact Info", icon: Phone },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Engage",
    links: [
      { to: "/meeting", label: "Meeting Settings", icon: Calendar },
      { to: "/meeting-bookings", label: "Meeting Bookings", icon: CalendarCheck },
      { to: "/messages", label: "Messages", icon: Inbox },
    ],
  },
];

function pageTitleFromPath(pathname) {
  for (const group of groups) {
    for (const link of group.links) {
      if (pathname === link.to) return link.label;
    }
  }
  return "CMS";
}

function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className={`admin${navOpen ? " admin--nav-open" : ""}`}>
      <button
        type="button"
        className="admin__backdrop"
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />

      <aside className="admin__sidebar">
        <div className="admin__brand-block">
          <div>
            <p className="admin__brand">Portfolio CMS</p>
            <p className="admin__user">{user?.email}</p>
          </div>
        </div>

        <nav className="admin__nav" aria-label="CMS sections">
          {groups.map((group) => (
            <div key={group.label} className="admin__group">
              <p className="admin__group-label">{group.label}</p>
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      isActive ? "admin__link admin__link--active" : "admin__link"
                    }
                  >
                    <Icon size={16} strokeWidth={2} aria-hidden="true" />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin__footer">
          <button type="button" className="admin__logout" onClick={() => logout()}>
            <LogOut size={15} strokeWidth={2} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin__shell">
        <header className="admin__topbar">
          <button
            type="button"
            className="admin__menu-btn"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <p className="admin__topbar-title">{pageTitleFromPath(location.pathname)}</p>
        </header>

        <main className="admin__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
