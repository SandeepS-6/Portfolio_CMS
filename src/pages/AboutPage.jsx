import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { aboutApi } from "../services/api";
import {
  Field,
  FileUpload,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
} from "../components/ui";
import "./pages.css";
import "./AboutPage.css";

const SOCIAL_TYPES = [
  "github",
  "linkedin",
  "email",
  "x",
  "instagram",
  "portfolio",
];

function emptySocial() {
  return {
    id: `social-${Date.now()}`,
    label: "",
    href: "",
    type: "github",
  };
}

function emptyEducation() {
  return {
    id: `edu-${Date.now()}`,
    institution: "",
    degree: "",
    period: "",
    grade: "",
  };
}

function emptyExperience() {
  return {
    id: `exp-${Date.now()}`,
    company: "",
    role: "",
    period: "",
    summary: "",
    tech: [],
    logoText: "",
  };
}

function normalizeForm(data = {}) {
  return {
    eyebrow: data.eyebrow || "",
    hello: data.hello || "",
    greeting: data.greeting || "",
    name: data.name || "",
    title: data.title || "",
    location: data.location || "",
    phone: data.phone || "",
    phoneHref: data.phoneHref || "",
    status: data.status || "",
    availability: data.availability || "",
    experienceYears: data.experienceYears || "",
    design: data.design || "",
    resumeLabel: data.resumeLabel || "",
    resumeHref: data.resumeHref || "",
    resumeFileName: data.resumeFileName || "",
    photoSrc: data.photo?.src || "",
    photoAlt: data.photo?.alt || "",
    story: Array.isArray(data.story) ? data.story.map(String) : [],
    interests: Array.isArray(data.interests) ? data.interests.map(String) : [],
    socials: Array.isArray(data.socials)
      ? data.socials.map((s) => ({
          id: s.id || `social-${Date.now()}`,
          label: s.label || "",
          href: s.href || "",
          type: s.type || "github",
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((e) => ({
          id: e.id || `edu-${Date.now()}`,
          institution: e.institution || "",
          degree: e.degree || "",
          period: e.period || "",
          grade: e.grade || "",
        }))
      : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((e) => ({
          id: e.id || `exp-${Date.now()}`,
          company: e.company || "",
          role: e.role || "",
          period: e.period || "",
          summary: e.summary || "",
          tech: Array.isArray(e.tech) ? e.tech.map(String) : [],
          logoText: e.logoText || "",
        }))
      : [],
  };
}

function toPayload(form) {
  return {
    eyebrow: form.eyebrow,
    hello: form.hello,
    greeting: form.greeting,
    name: form.name,
    title: form.title,
    location: form.location,
    phone: form.phone,
    phoneHref: form.phoneHref,
    status: form.status,
    availability: form.availability,
    experienceYears: form.experienceYears,
    design: form.design,
    resumeLabel: form.resumeLabel,
    resumeHref: form.resumeHref,
    resumeFileName: form.resumeFileName,
    photo: { src: form.photoSrc, alt: form.photoAlt },
    story: form.story.filter((p) => p.trim()),
    interests: form.interests.filter((i) => i.trim()),
    socials: form.socials,
    education: form.education,
    experience: form.experience.map((e) => ({
      ...e,
      tech: Array.isArray(e.tech) ? e.tech : [],
    })),
  };
}

function AboutPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    aboutApi
      .get()
      .then((data) => setForm(normalizeForm(data)))
      .catch((err) => setStatus(err.message));
  }, []);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onChange(event) {
    const { name, value } = event.target;
    setField(name, value);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      if (!form.name.trim()) {
        throw new Error("Name is required — the live site uses it to detect About content");
      }
      const saved = await aboutApi.update(toPayload(form));
      setForm(normalizeForm(saved));
      setStatus("Saved. Refresh the portfolio to see updates.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader
          eyebrow="Content"
          title="About"
          lead="Profile, story, socials, education, and experience."
        />
        <Panel>
          <LoadingBlock />
        </Panel>
      </section>
    );
  }

  return (
    <section className="page about-cms">
      <PageHeader
        eyebrow="Content"
        title="About"
        lead="Fill this page to power the About Me section. Leave empty until ready — the site keeps a local fallback until Name is saved."
      />

      <form className="about-cms__form" onSubmit={onSubmit}>
        <Panel title="Identity" meta="Greeting, name, title, location">
          <div className="form form--grid">
            <Field label="Eyebrow" name="eyebrow" value={form.eyebrow} onChange={onChange} />
            <Field
              label="Hello stamp"
              name="hello"
              value={form.hello}
              onChange={onChange}
              placeholder="HELLO."
            />
            <Field label="Greeting" name="greeting" value={form.greeting} onChange={onChange} placeholder="Hi, I'm" />
            <Field label="Name" name="name" value={form.name} onChange={onChange} required />
            <Field label="Title" name="title" value={form.title} onChange={onChange} />
            <Field label="Location" name="location" value={form.location} onChange={onChange} />
          </div>
        </Panel>

        <Panel title="Photo" meta="Upload or paste a public URL">
          <div className="form form--grid">
            <FileUpload
              label="Profile photo"
              value={form.photoSrc}
              accept="image/*"
              onChange={(url) => setField("photoSrc", url)}
              hint="Shown on the About profile card"
            />
            <Field label="Photo alt" name="photoAlt" value={form.photoAlt} onChange={onChange} full />
          </div>
        </Panel>

        <Panel title="Quick facts" meta="Shown in the profile card">
          <div className="form form--grid">
            <Field label="Status" name="status" value={form.status} onChange={onChange} />
            <Field
              label="Availability"
              name="availability"
              value={form.availability}
              onChange={onChange}
            />
            <Field
              label="Experience years"
              name="experienceYears"
              value={form.experienceYears}
              onChange={onChange}
              placeholder="1+ yr"
            />
            <Field label="Design focus" name="design" value={form.design} onChange={onChange} />
            <Field label="Phone" name="phone" value={form.phone} onChange={onChange} />
            <Field
              label="Phone href"
              name="phoneHref"
              value={form.phoneHref}
              onChange={onChange}
              placeholder="tel:+91..."
            />
          </div>
        </Panel>

        <Panel title="Resume" meta="PDF upload or paste a link">
          <div className="form form--grid">
            <Field
              label="Resume label"
              name="resumeLabel"
              value={form.resumeLabel}
              onChange={onChange}
            />
            <Field
              label="Download file name"
              name="resumeFileName"
              value={form.resumeFileName}
              onChange={onChange}
            />
            <FileUpload
              label="Resume file"
              value={form.resumeHref}
              accept="application/pdf,image/*"
              onChange={(url, meta) => {
                setForm((prev) => ({
                  ...prev,
                  resumeHref: url,
                  resumeFileName:
                    meta?.fileName || prev.resumeFileName || "resume.pdf",
                }));
              }}
              hint="PDF recommended — powers the Download Resume button"
            />
          </div>
        </Panel>

        <Panel title="Story" meta="Paragraphs under the profile">
          <div className="about-cms__list">
            {form.story.map((paragraph, index) => (
              <div key={`story-${index}`} className="about-cms__block">
                <div className="about-cms__block-head">
                  <p className="about-cms__block-title">Paragraph {index + 1}</p>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      setField(
                        "story",
                        form.story.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <Field
                  label="Text"
                  type="textarea"
                  rows={4}
                  value={paragraph}
                  onChange={(e) => {
                    const next = form.story.slice();
                    next[index] = e.target.value;
                    setField("story", next);
                  }}
                  full
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setField("story", [...form.story, ""])}
            >
              <Plus size={16} aria-hidden="true" />
              Add paragraph
            </button>
          </div>
        </Panel>

        <Panel title="Interests" meta="Chips under quick facts">
          <div className="about-cms__list">
            {form.interests.map((interest, index) => (
              <div key={`interest-${index}`} className="about-cms__inline">
                <Field
                  label={`Interest ${index + 1}`}
                  value={interest}
                  onChange={(e) => {
                    const next = form.interests.slice();
                    next[index] = e.target.value;
                    setField("interests", next);
                  }}
                />
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() =>
                    setField(
                      "interests",
                      form.interests.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setField("interests", [...form.interests, ""])}
            >
              <Plus size={16} aria-hidden="true" />
              Add interest
            </button>
          </div>
        </Panel>

        <Panel title="Social links" meta="Icons on the profile card">
          <div className="about-cms__list">
            {form.socials.map((social, index) => (
              <div key={social.id} className="about-cms__block">
                <div className="about-cms__block-head">
                  <p className="about-cms__block-title">
                    {social.label?.trim() || `Social ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      setField(
                        "socials",
                        form.socials.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="form form--grid">
                  <Field
                    label="Label"
                    value={social.label}
                    onChange={(e) => {
                      const next = form.socials.slice();
                      next[index] = { ...social, label: e.target.value };
                      setField("socials", next);
                    }}
                  />
                  <label className="form__field">
                    <span className="form__label">Type</span>
                    <select
                      value={social.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        const next = form.socials.slice();
                        next[index] = {
                          ...social,
                          type,
                          id: social.id || type,
                        };
                        setField("socials", next);
                      }}
                    >
                      {SOCIAL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Href"
                    value={social.href}
                    onChange={(e) => {
                      const next = form.socials.slice();
                      next[index] = { ...social, href: e.target.value };
                      setField("socials", next);
                    }}
                    full
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setField("socials", [...form.socials, emptySocial()])}
            >
              <Plus size={16} aria-hidden="true" />
              Add social
            </button>
          </div>
        </Panel>

        <Panel title="Education" meta="Timeline on the About section">
          <div className="about-cms__list">
            {form.education.map((item, index) => (
              <div key={item.id} className="about-cms__block">
                <div className="about-cms__block-head">
                  <p className="about-cms__block-title">
                    {item.institution?.trim() || `Education ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      setField(
                        "education",
                        form.education.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="form form--grid">
                  <Field
                    label="Institution"
                    value={item.institution}
                    onChange={(e) => {
                      const next = form.education.slice();
                      next[index] = { ...item, institution: e.target.value };
                      setField("education", next);
                    }}
                  />
                  <Field
                    label="Period"
                    value={item.period}
                    onChange={(e) => {
                      const next = form.education.slice();
                      next[index] = { ...item, period: e.target.value };
                      setField("education", next);
                    }}
                    placeholder="2016 — 2020"
                  />
                  <Field
                    label="Degree"
                    value={item.degree}
                    onChange={(e) => {
                      const next = form.education.slice();
                      next[index] = { ...item, degree: e.target.value };
                      setField("education", next);
                    }}
                    full
                  />
                  <Field
                    label="Grade"
                    value={item.grade}
                    onChange={(e) => {
                      const next = form.education.slice();
                      next[index] = { ...item, grade: e.target.value };
                      setField("education", next);
                    }}
                    full
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                setField("education", [...form.education, emptyEducation()])
              }
            >
              <Plus size={16} aria-hidden="true" />
              Add education
            </button>
          </div>
        </Panel>

        <Panel title="Experience" meta="Work timeline + tech tags">
          <div className="about-cms__list">
            {form.experience.map((item, index) => (
              <div key={item.id} className="about-cms__block">
                <div className="about-cms__block-head">
                  <p className="about-cms__block-title">
                    {item.company?.trim() || `Experience ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      setField(
                        "experience",
                        form.experience.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="form form--grid">
                  <Field
                    label="Company"
                    value={item.company}
                    onChange={(e) => {
                      const next = form.experience.slice();
                      next[index] = { ...item, company: e.target.value };
                      setField("experience", next);
                    }}
                  />
                  <Field
                    label="Role"
                    value={item.role}
                    onChange={(e) => {
                      const next = form.experience.slice();
                      next[index] = { ...item, role: e.target.value };
                      setField("experience", next);
                    }}
                  />
                  <Field
                    label="Period"
                    value={item.period}
                    onChange={(e) => {
                      const next = form.experience.slice();
                      next[index] = { ...item, period: e.target.value };
                      setField("experience", next);
                    }}
                    placeholder="2023 — Present"
                  />
                  <Field
                    label="Logo text"
                    value={item.logoText}
                    onChange={(e) => {
                      const next = form.experience.slice();
                      next[index] = { ...item, logoText: e.target.value };
                      setField("experience", next);
                    }}
                    placeholder="IN"
                    hint="2–3 letters shown in the timeline mark"
                  />
                  <Field
                    label="Summary"
                    type="textarea"
                    rows={3}
                    value={item.summary}
                    onChange={(e) => {
                      const next = form.experience.slice();
                      next[index] = { ...item, summary: e.target.value };
                      setField("experience", next);
                    }}
                    full
                  />
                  <Field
                    label="Tech (comma-separated)"
                    value={item.tech.join(", ")}
                    onChange={(e) => {
                      const tech = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      const next = form.experience.slice();
                      next[index] = { ...item, tech };
                      setField("experience", next);
                    }}
                    full
                    placeholder="React, TypeScript, GSAP"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() =>
                setField("experience", [...form.experience, emptyExperience()])
              }
            >
              <Plus size={16} aria-hidden="true" />
              Add experience
            </button>
          </div>
        </Panel>

        <div className="about-cms__footer">
          <button type="submit" className="btn">
            <Save size={16} aria-hidden="true" />
            Save About
          </button>
          <StatusBanner status={status} />
        </div>
      </form>
    </section>
  );
}

export default AboutPage;
