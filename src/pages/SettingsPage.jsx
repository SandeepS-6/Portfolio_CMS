import { useEffect, useMemo, useState } from "react";
import {
  EyeOff,
  Globe2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { settingsApi } from "../services/api";
import {
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
} from "../components/ui";
import "./pages.css";
import "./SettingsPage.css";

const SECTION_TOGGLES = [
  { key: "showHero", label: "Hero", note: "Opening stage and intro" },
  { key: "showAbout", label: "About", note: "Story and background" },
  { key: "showWhatIDo", label: "What I Do", note: "Capability cards" },
  { key: "showSkills", label: "Skills", note: "Tech stack section" },
  { key: "showProjects", label: "Projects", note: "Selected work" },
  { key: "showContact", label: "Contact", note: "Ending + CTA" },
];

function emptyForm() {
  return {
    siteTitle: "",
    siteDescription: "",
    logoText: "",
    primaryColor: "#f17a32",
    seoKeywords: "",
    isActive: true,
    maintenanceMode: false,
    showHero: true,
    showAbout: true,
    showWhatIDo: true,
    showSkills: true,
    showProjects: true,
    showContact: true,
  };
}

function SwitchRow({ name, checked, onChange, label, note, danger = false }) {
  return (
    <label className={`settings-switch${danger ? " settings-switch--danger" : ""}`}>
      <span className="settings-switch__copy">
        <span className="settings-switch__label">{label}</span>
        {note ? <span className="settings-switch__note">{note}</span> : null}
      </span>
      <span className="toggle">
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          onChange={onChange}
        />
        <span className="toggle__track" aria-hidden="true" />
      </span>
    </label>
  );
}

function SettingsPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setForm({
          siteTitle: data.siteTitle || "",
          siteDescription: data.siteDescription || "",
          logoText: data.logoText || "",
          primaryColor: data.primaryColor || "#f17a32",
          seoKeywords: Array.isArray(data.seoKeywords)
            ? data.seoKeywords.join(", ")
            : "",
          isActive: data.isActive !== false,
          maintenanceMode: Boolean(data.maintenanceMode),
          showHero: data.showHero !== false,
          showAbout: data.showAbout !== false,
          showWhatIDo: data.showWhatIDo !== false,
          showSkills: data.showSkills !== false,
          showProjects: data.showProjects !== false,
          showContact: data.showContact !== false,
        });
      })
      .catch((err) => {
        setForm(emptyForm());
        setStatus(err.message);
      });
  }, []);

  const statusTone = useMemo(() => {
    if (!form) return "idle";
    if (form.maintenanceMode) return "maintenance";
    if (!form.isActive) return "offline";
    return "live";
  }, [form]);

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setStatus("Saving...");
    try {
      const saved = await settingsApi.update({
        ...form,
        seoKeywords: String(form.seoKeywords || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isActive: !!form.isActive,
        maintenanceMode: !!form.maintenanceMode,
        showHero: !!form.showHero,
        showAbout: !!form.showAbout,
        showWhatIDo: !!form.showWhatIDo,
        showSkills: !!form.showSkills,
        showProjects: !!form.showProjects,
        showContact: !!form.showContact,
      });
      setForm((prev) => ({
        ...prev,
        ...saved,
        seoKeywords: Array.isArray(saved.seoKeywords)
          ? saved.seoKeywords.join(", ")
          : prev.seoKeywords,
      }));
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader
          eyebrow="Site"
          title="Settings"
          lead="Branding, SEO, and which sections are active on the live site."
        />
        <Panel>
          <LoadingBlock />
        </Panel>
      </section>
    );
  }

  return (
    <section className="page settings-page">
      <PageHeader
        eyebrow="Site"
        title="Settings"
        lead="Control site identity, SEO, maintenance, and which homepage sections stay active."
      />

      <div className={`settings-status settings-status--${statusTone}`}>
        <div className="settings-status__icon" aria-hidden="true">
          {statusTone === "live" ? <Globe2 size={18} /> : null}
          {statusTone === "maintenance" ? <ShieldAlert size={18} /> : null}
          {statusTone === "offline" ? <EyeOff size={18} /> : null}
        </div>
        <div className="settings-status__copy">
          <p className="settings-status__title">
            {statusTone === "live" && "Site is live"}
            {statusTone === "maintenance" && "Maintenance mode on"}
            {statusTone === "offline" && "Site marked inactive"}
          </p>
          <p className="settings-status__note">
            {statusTone === "live" &&
              "Visitors see the portfolio. Toggle sections below to show or hide blocks."}
            {statusTone === "maintenance" &&
              "Public visitors see a maintenance screen until you turn this off."}
            {statusTone === "offline" &&
              "Treat the site as offline in CMS. Turn Active on to publish again."}
          </p>
        </div>
      </div>

      <form className="settings-layout" onSubmit={onSubmit}>
        <div className="settings-layout__main">
          <Panel title="Branding" meta="Shown in browser tabs and site chrome">
            <div className="form form--grid settings-form">
              <Field
                label="Site title"
                name="siteTitle"
                value={form.siteTitle}
                onChange={onChange}
              />
              <Field
                label="Logo text"
                name="logoText"
                value={form.logoText}
                onChange={onChange}
              />
              <label className="form__field settings-color">
                <span className="form__label">Primary color</span>
                <span className="settings-color__row">
                  <input
                    type="color"
                    name="primaryColor"
                    value={form.primaryColor || "#f17a32"}
                    onChange={onChange}
                    aria-label="Primary color picker"
                  />
                  <input
                    className="form__input"
                    type="text"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={onChange}
                    placeholder="#f17a32"
                  />
                </span>
              </label>
            </div>
          </Panel>

          <Panel title="SEO" meta="Search and social metadata">
            <div className="form settings-form">
              <Field
                label="Site description"
                name="siteDescription"
                type="textarea"
                rows={3}
                value={form.siteDescription}
                onChange={onChange}
                full
              />
              <Field
                label="SEO keywords"
                name="seoKeywords"
                value={form.seoKeywords}
                onChange={onChange}
                hint="Comma-separated, e.g. frontend, react, portfolio"
                full
              />
            </div>
          </Panel>
        </div>

        <aside className="settings-layout__side">
          <Panel title="Site status" meta="Master switches">
            <div className="settings-switch-list">
              <SwitchRow
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
                label="Site active"
                note="Portfolio is published and reachable"
              />
              <SwitchRow
                name="maintenanceMode"
                checked={form.maintenanceMode}
                onChange={onChange}
                label="Maintenance mode"
                note="Show a temporary maintenance screen"
                danger
              />
            </div>
          </Panel>

          <Panel title="Active sections" meta="Homepage visibility">
            <div className="settings-switch-list">
              {SECTION_TOGGLES.map((item) => (
                <SwitchRow
                  key={item.key}
                  name={item.key}
                  checked={form[item.key]}
                  onChange={onChange}
                  label={item.label}
                  note={item.note}
                />
              ))}
            </div>
          </Panel>
        </aside>

        <div className="settings-save">
          <button type="submit" className="btn" disabled={saving}>
            <Save size={16} aria-hidden="true" />
            {saving ? "Saving…" : "Save settings"}
          </button>
          <StatusBanner status={status} />
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;
