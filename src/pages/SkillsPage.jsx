import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { skillsApi } from "../services/api";
import {
  EmptyState,
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  SearchToolbar,
  StatusBanner,
  Toggle,
} from "../components/ui";
import "./pages.css";

const emptySkill = {
  title: "",
  icon: "",
  color: "#f17a32",
  category: "frontend",
  displayOrder: 0,
  isVisible: true,
  positionX: 50,
  positionY: 50,
  scale: 1,
  blur: 1.2,
  opacity: 0.7,
};

function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptySkill);
  const [status, setStatus] = useState("");

  async function load() {
    const data = await skillsApi.list();
    setSkills(data);
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setStatus(err.message))
      .finally(() => setLoading(false));
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setStatus("Creating...");
    try {
      await skillsApi.create({
        ...form,
        initialPosition: { x: form.positionX, y: form.positionY },
      });
      setForm(emptySkill);
      await load();
      setStatus("Created.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  async function onDelete(id) {
    await skillsApi.remove(id);
    await load();
  }

  async function toggleVisible(skill) {
    await skillsApi.update(skill.id, { isVisible: !skill.isVisible });
    await load();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return skills;
    return skills.filter((skill) =>
      [skill.title, skill.category, skill.icon]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [skills, query]);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Content"
        title="Skills"
        lead="Floating badge content for the hero skill cloud."
      />

      <Panel title="Add skill" meta="Visible skills appear in the public hero">
        <form className="form form--grid" onSubmit={onCreate}>
          <Field
            label="Title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
          <Field
            label="Icon"
            name="icon"
            value={form.icon}
            onChange={onChange}
            placeholder="react"
          />
          <Field label="Color" name="color" value={form.color} onChange={onChange} />
          <Field
            label="Category"
            name="category"
            value={form.category}
            onChange={onChange}
          />
          <Field
            label="Display order"
            name="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={onChange}
          />
          <Toggle
            name="isVisible"
            checked={form.isVisible}
            onChange={onChange}
            label="Visible"
          />
          <div className="form__footer form__span-full">
            <button type="submit" className="btn">
              <Plus size={16} aria-hidden="true" />
              Add Skill
            </button>
            <StatusBanner status={status} />
          </div>
        </form>
      </Panel>

      <Panel title="Skill list" meta={`${skills.length} total`} flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <SearchToolbar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills…"
              countLabel={`${filtered.length} shown`}
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title={skills.length === 0 ? "No skills yet" : "No matches"}
                detail={
                  skills.length === 0
                    ? "Add your first skill badge above."
                    : "Try a different search term."
                }
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Visible</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((skill) => (
                      <tr key={skill.id}>
                        <td>
                          <strong>{skill.title}</strong>
                        </td>
                        <td>
                          <span className="badge badge--muted">{skill.category}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => toggleVisible(skill)}
                          >
                            {skill.isVisible ? (
                              <Eye size={14} aria-hidden="true" />
                            ) : (
                              <EyeOff size={14} aria-hidden="true" />
                            )}
                            {skill.isVisible ? "Yes" : "No"}
                          </button>
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => onDelete(skill.id)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Panel>
    </section>
  );
}

export default SkillsPage;
