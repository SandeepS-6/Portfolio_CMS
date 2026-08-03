import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { skillsSectionApi } from "../services/api";
import {
  Field,
  FileUpload,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
} from "../components/ui";
import { guessTechIcon, lookupTechMeta } from "../tech/techMeta";
import "./pages.css";
import "./SkillsSectionPage.css";

function emptyStat() {
  return { id: `stat-${Date.now()}`, value: "", label: "", icon: "star" };
}

function emptyBar() {
  return { id: `bar-${Date.now()}`, label: "", value: 80, stars: 4 };
}

function emptyCategory() {
  return {
    id: `cat-${Date.now()}`,
    title: "",
    detail: "",
    icon: "frontend",
    tone: "sky",
    techs: [],
  };
}

function emptyTech() {
  return { name: "", icon: "", color: "2a2a32" };
}

function normalizeTech(tech = {}) {
  const name = tech.name || "";
  const meta = lookupTechMeta(name) || {};
  return {
    name,
    icon: tech.icon || meta.icon || guessTechIcon(name),
    color: String(tech.color || meta.color || "2a2a32").replace(/^#/, ""),
    ...(tech.src ? { src: tech.src } : {}),
  };
}

function normalizeForm(data = {}) {
  return {
    eyebrow: data.eyebrow || "",
    headline: data.headline || "",
    lead: data.lead || "",
    stats: Array.isArray(data.stats) ? data.stats.map((s) => ({ ...s })) : [],
    categories: Array.isArray(data.categories)
      ? data.categories.map((cat) => ({
          ...cat,
          techs: Array.isArray(cat.techs) ? cat.techs.map(normalizeTech) : [],
        }))
      : [],
    expertise: {
      title: data.expertise?.title || "",
      overall: Number(data.expertise?.overall ?? 0),
      overallLabel: data.expertise?.overallLabel || "",
      bars: Array.isArray(data.expertise?.bars)
        ? data.expertise.bars.map((b) => ({ ...b }))
        : [],
    },
    favourites: {
      title: data.favourites?.title || "",
      note: data.favourites?.note || "",
      techs: Array.isArray(data.favourites?.techs)
        ? data.favourites.techs.map(normalizeTech)
        : [],
    },
    learning: {
      title: data.learning?.title || "",
      name: data.learning?.name || "",
      detail: data.learning?.detail || "",
      percent: Number(data.learning?.percent ?? 0),
      tech: normalizeTech(data.learning?.tech || {}),
    },
    marquee: {
      title: data.marquee?.title || "",
      moreLabel: data.marquee?.moreLabel || "",
      techs: Array.isArray(data.marquee?.techs)
        ? data.marquee.techs.map(normalizeTech)
        : [],
    },
  };
}

function TechRows({
  techs,
  onChange,
  showSrc = false,
  title = "Techs",
  note = "Each tech needs a display name. Icon slug and color fill in automatically when known.",
}) {
  function setTech(index, patch) {
    onChange(
      techs.map((tech, i) => {
        if (i !== index) return tech;
        const next = { ...tech, ...patch };
        if (patch.name !== undefined) {
          const meta = lookupTechMeta(patch.name) || {};
          if (!tech.icon || tech.icon === guessTechIcon(tech.name)) {
            next.icon = meta.icon || guessTechIcon(patch.name);
          }
          if (!tech.color || tech.color === "2a2a32") {
            next.color = meta.color || tech.color || "2a2a32";
          }
        }
        return next;
      }),
    );
  }

  return (
    <div className="skills-sec__techs">
      <div className="skills-sec__techs-head">
        <p className="skills-sec__block-title">{title}</p>
        {note ? <p className="skills-sec__note">{note}</p> : null}
      </div>

      {techs.map((tech, index) => (
        <div key={`${tech.name}-${index}`} className="skills-sec__tech-card">
          <div className="skills-sec__block-head">
            <p className="skills-sec__block-title">
              {tech.name?.trim() || `Tech ${index + 1}`}
            </p>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onChange(techs.filter((_, i) => i !== index))}
            >
              <Trash2 size={14} aria-hidden="true" />
              Remove
            </button>
          </div>
          <div className="form form--grid">
            <Field
              label="Name"
              value={tech.name}
              onChange={(e) => setTech(index, { name: e.target.value })}
              placeholder="e.g. MongoDB"
              hint="Label shown on the site"
            />
            <Field
              label="Icon slug"
              value={tech.icon}
              onChange={(e) => setTech(index, { icon: e.target.value })}
              placeholder="e.g. mongodb"
              hint="Simple Icons id (usually auto-filled)"
            />
            <Field
              label="Color"
              value={tech.color}
              onChange={(e) =>
                setTech(index, { color: e.target.value.replace(/^#/, "") })
              }
              placeholder="47A248"
              hint="Hex without # — brand tint for the icon"
            />
            {showSrc ? (
              <FileUpload
                label="Custom icon"
                value={tech.src || ""}
                accept="image/*"
                onChange={(url) => setTech(index, { src: url })}
                hint="Optional. Leave blank to use Simple Icons from the slug."
              />
            ) : null}
          </div>
        </div>
      ))}

      <div className="skills-sec__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange([...techs, emptyTech()])}
        >
          <Plus size={14} aria-hidden="true" />
          Add tech
        </button>
      </div>
    </div>
  );
}

function SkillsSectionPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    skillsSectionApi
      .get()
      .then((data) => setForm(normalizeForm(data)))
      .catch((err) => setStatus(err.message));
  }, []);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setNested(section, name, value) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
  }

  function patchList(key, index, patch) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function onTopChange(event) {
    const { name, value } = event.target;
    setField(name, value);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      await skillsSectionApi.update({
        eyebrow: form.eyebrow,
        headline: form.headline,
        lead: form.lead,
        stats: form.stats,
        categories: form.categories.map((cat) => ({
          ...cat,
          techs: cat.techs.map(normalizeTech).filter((t) => t.name.trim()),
        })),
        expertise: {
          ...form.expertise,
          overall: Number(form.expertise.overall) || 0,
          bars: form.expertise.bars.map((bar) => ({
            ...bar,
            value: Number(bar.value) || 0,
            stars: Number(bar.stars) || 0,
          })),
        },
        favourites: {
          ...form.favourites,
          techs: form.favourites.techs.map(normalizeTech).filter((t) => t.name.trim()),
        },
        learning: {
          ...form.learning,
          percent: Number(form.learning.percent) || 0,
          tech: normalizeTech(form.learning.tech),
        },
        marquee: {
          ...form.marquee,
          techs: form.marquee.techs.map(normalizeTech).filter((t) => t.name.trim()),
        },
      });
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader
          eyebrow="Content"
          title="Skills Section"
          lead="Technologies I Work With — stats, categories, and side panels."
        />
        <Panel>
          <LoadingBlock />
        </Panel>
      </section>
    );
  }

  return (
    <section className="page skills-sec">
      <PageHeader
        eyebrow="Content"
        title="Skills Section"
        lead="Edit the public Technologies section with normal fields — no JSON."
      />

      <form className="skills-sec" onSubmit={onSubmit}>
        <Panel title="Section copy" meta="Headline and intro on the site">
          <div className="form form--grid">
            <Field
              label="Eyebrow"
              name="eyebrow"
              value={form.eyebrow}
              onChange={onTopChange}
            />
            <Field
              label="Headline"
              name="headline"
              value={form.headline}
              onChange={onTopChange}
            />
            <Field
              label="Lead"
              name="lead"
              type="textarea"
              rows={3}
              value={form.lead}
              onChange={onTopChange}
              full
            />
          </div>
        </Panel>

        <Panel
          title="Stats"
          meta={`${form.stats.length} widgets beside the headline`}
        >
          <p className="skills-sec__note">
            Numbers shown next to “Technologies I Work With” (years, projects, tech count).
          </p>
          {form.stats.map((stat, index) => (
            <div key={stat.id || index} className="skills-sec__block">
              <div className="skills-sec__block-head">
                <p className="skills-sec__block-title">Stat {index + 1}</p>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() =>
                    setField(
                      "stats",
                      form.stats.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="form form--grid">
                <Field
                  label="Value"
                  value={stat.value}
                  onChange={(e) => patchList("stats", index, { value: e.target.value })}
                  placeholder="3+"
                  hint="Big number on the widget"
                />
                <Field
                  label="Label"
                  value={stat.label}
                  onChange={(e) => patchList("stats", index, { label: e.target.value })}
                  placeholder="Years of Experience"
                  hint="Small text under the value"
                />
                <Field
                  label="Icon key"
                  value={stat.icon || ""}
                  onChange={(e) => patchList("stats", index, { icon: e.target.value })}
                  placeholder="code"
                  hint="Use: code, rocket, or star"
                />
                <Field
                  label="Id"
                  value={stat.id || ""}
                  onChange={(e) => patchList("stats", index, { id: e.target.value })}
                  placeholder="years"
                  hint="Internal key — keep unique and stable"
                />
              </div>
            </div>
          ))}
          <div className="skills-sec__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setField("stats", [...form.stats, emptyStat()])}
            >
              <Plus size={14} aria-hidden="true" />
              Add stat
            </button>
          </div>
        </Panel>

        <Panel
          title="Categories"
          meta={`${form.categories.length} groups — Frontend, Backend, …`}
        >
          <p className="skills-sec__note">
            Main skill cards on the page. Each category has a title, short detail, and a list of technologies.
          </p>
          {form.categories.map((cat, index) => (
            <div key={cat.id || index} className="skills-sec__block">
              <div className="skills-sec__block-head">
                <p className="skills-sec__block-title">
                  {cat.title || `Category ${index + 1}`}
                </p>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() =>
                    setField(
                      "categories",
                      form.categories.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="form form--grid">
                <Field
                  label="Title"
                  value={cat.title}
                  onChange={(e) =>
                    patchList("categories", index, { title: e.target.value })
                  }
                  placeholder="Database"
                  hint="Category heading on the card"
                />
                <Field
                  label="Tone"
                  value={cat.tone || ""}
                  onChange={(e) =>
                    patchList("categories", index, { tone: e.target.value })
                  }
                  placeholder="amber"
                  hint="Accent color: sky, green, amber, blue, violet, rose"
                />
                <Field
                  label="Icon key"
                  value={cat.icon || ""}
                  onChange={(e) =>
                    patchList("categories", index, { icon: e.target.value })
                  }
                  placeholder="database"
                  hint="Category header icon key"
                />
                <Field
                  label="Id"
                  value={cat.id || ""}
                  onChange={(e) =>
                    patchList("categories", index, { id: e.target.value })
                  }
                  placeholder="database"
                  hint="Internal key — keep unique and stable"
                />
                <Field
                  label="Detail"
                  type="textarea"
                  rows={2}
                  value={cat.detail || ""}
                  onChange={(e) =>
                    patchList("categories", index, { detail: e.target.value })
                  }
                  placeholder="Storing and managing data efficiently…"
                  hint="Short description under the category title"
                  full
                />
              </div>
              <TechRows
                techs={cat.techs}
                showSrc
                title="Technologies in this category"
                note="Add each tool shown under this category card on the site."
                onChange={(techs) => patchList("categories", index, { techs })}
              />
            </div>
          ))}
          <div className="skills-sec__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() =>
                setField("categories", [...form.categories, emptyCategory()])
              }
            >
              <Plus size={14} aria-hidden="true" />
              Add category
            </button>
          </div>
        </Panel>

        <Panel title="Expertise" meta="Bars and overall score">
          <div className="form form--grid">
            <Field
              label="Title"
              value={form.expertise.title}
              onChange={(e) => setNested("expertise", "title", e.target.value)}
            />
            <Field
              label="Overall label"
              value={form.expertise.overallLabel}
              onChange={(e) =>
                setNested("expertise", "overallLabel", e.target.value)
              }
            />
            <Field
              label="Overall %"
              type="number"
              value={form.expertise.overall}
              onChange={(e) =>
                setNested("expertise", "overall", e.target.value)
              }
            />
          </div>
          {form.expertise.bars.map((bar, index) => (
            <div key={bar.id || index} className="skills-sec__block">
              <div className="skills-sec__block-head">
                <p className="skills-sec__block-title">
                  {bar.label || `Bar ${index + 1}`}
                </p>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() =>
                    setNested(
                      "expertise",
                      "bars",
                      form.expertise.bars.filter((_, i) => i !== index),
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
                  value={bar.label}
                  onChange={(e) => {
                    const bars = form.expertise.bars.map((item, i) =>
                      i === index ? { ...item, label: e.target.value } : item,
                    );
                    setNested("expertise", "bars", bars);
                  }}
                />
                <Field
                  label="Value %"
                  type="number"
                  value={bar.value}
                  onChange={(e) => {
                    const bars = form.expertise.bars.map((item, i) =>
                      i === index ? { ...item, value: e.target.value } : item,
                    );
                    setNested("expertise", "bars", bars);
                  }}
                />
                <Field
                  label="Stars"
                  type="number"
                  value={bar.stars}
                  onChange={(e) => {
                    const bars = form.expertise.bars.map((item, i) =>
                      i === index ? { ...item, stars: e.target.value } : item,
                    );
                    setNested("expertise", "bars", bars);
                  }}
                />
                <Field
                  label="Id"
                  value={bar.id || ""}
                  onChange={(e) => {
                    const bars = form.expertise.bars.map((item, i) =>
                      i === index ? { ...item, id: e.target.value } : item,
                    );
                    setNested("expertise", "bars", bars);
                  }}
                />
              </div>
            </div>
          ))}
          <div className="skills-sec__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() =>
                setNested("expertise", "bars", [
                  ...form.expertise.bars,
                  emptyBar(),
                ])
              }
            >
              <Plus size={14} aria-hidden="true" />
              Add bar
            </button>
          </div>
        </Panel>

        <Panel title="Favourite tech" meta="Side panel favourites">
          <div className="form form--grid">
            <Field
              label="Title"
              value={form.favourites.title}
              onChange={(e) => setNested("favourites", "title", e.target.value)}
            />
            <Field
              label="Note"
              type="textarea"
              rows={2}
              value={form.favourites.note}
              onChange={(e) => setNested("favourites", "note", e.target.value)}
              full
            />
          </div>
          <TechRows
            techs={form.favourites.techs}
            title="Favourite technologies"
            note="Icons listed in the Favourite Tech side panel."
            showSrc
            onChange={(techs) => setNested("favourites", "techs", techs)}
          />
        </Panel>

        <Panel title="Currently learning" meta="Progress card">
          <div className="form form--grid">
            <Field
              label="Card title"
              value={form.learning.title}
              onChange={(e) => setNested("learning", "title", e.target.value)}
            />
            <Field
              label="Display name"
              value={form.learning.name}
              onChange={(e) => setNested("learning", "name", e.target.value)}
            />
            <Field
              label="Percent"
              type="number"
              value={form.learning.percent}
              onChange={(e) => setNested("learning", "percent", e.target.value)}
            />
            <Field
              label="Detail"
              type="textarea"
              rows={2}
              value={form.learning.detail}
              onChange={(e) => setNested("learning", "detail", e.target.value)}
              full
            />
            <Field
              label="Tech name"
              value={form.learning.tech.name}
              onChange={(e) => {
                const name = e.target.value;
                const meta = lookupTechMeta(name) || {};
                setNested("learning", "tech", {
                  ...form.learning.tech,
                  name,
                  icon:
                    form.learning.tech.icon &&
                    form.learning.tech.icon !== guessTechIcon(form.learning.tech.name)
                      ? form.learning.tech.icon
                      : meta.icon || guessTechIcon(name),
                  color:
                    form.learning.tech.color && form.learning.tech.color !== "2a2a32"
                      ? form.learning.tech.color
                      : meta.color || form.learning.tech.color || "2a2a32",
                });
              }}
            />
            <Field
              label="Tech icon"
              value={form.learning.tech.icon}
              onChange={(e) =>
                setNested("learning", "tech", {
                  ...form.learning.tech,
                  icon: e.target.value,
                })
              }
            />
            <Field
              label="Tech color"
              value={form.learning.tech.color}
              onChange={(e) =>
                setNested("learning", "tech", {
                  ...form.learning.tech,
                  color: e.target.value.replace(/^#/, ""),
                })
              }
            />
            <FileUpload
              label="Custom tech icon"
              value={form.learning.tech.src || ""}
              accept="image/*"
              onChange={(url) =>
                setNested("learning", "tech", {
                  ...form.learning.tech,
                  src: url,
                })
              }
              hint="Optional override — leave blank to use Simple Icons"
            />
          </div>
        </Panel>

        <Panel title="Marquee" meta="Scrolling tech strip">
          <div className="form form--grid">
            <Field
              label="Title"
              value={form.marquee.title}
              onChange={(e) => setNested("marquee", "title", e.target.value)}
            />
            <Field
              label="More label"
              value={form.marquee.moreLabel}
              onChange={(e) => setNested("marquee", "moreLabel", e.target.value)}
            />
          </div>
          <TechRows
            techs={form.marquee.techs}
            title="Marquee technologies"
            note="Icons that scroll in the strip at the bottom of the section."
            showSrc
            onChange={(techs) => setNested("marquee", "techs", techs)}
          />
        </Panel>

        <div className="skills-sec__sticky">
          <button type="submit" className="btn">
            <Save size={16} aria-hidden="true" />
            Save Skills Section
          </button>
          <StatusBanner status={status} />
        </div>
      </form>
    </section>
  );
}

export default SkillsSectionPage;
