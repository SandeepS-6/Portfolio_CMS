import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import {
  EmptyState,
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  SearchToolbar,
  StatusBanner,
  TechStackField,
  Toggle,
  labelize,
} from "../components/ui";
import "./pages.css";

function parseTechStackField(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ResourcePage({ title, api, fields, required = [], lead }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""])),
  );
  const [status, setStatus] = useState("");

  async function load() {
    setItems(await api.list());
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
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const body = { ...form };
      fields.forEach((f) => {
        if (f.type === "techStack") {
          const items = parseTechStackField(body[f.name]);
          body.techStack = items
            .map((entry) => (typeof entry === "string" ? entry : entry?.name))
            .filter(Boolean);
          body.techDetails = items
            .map((entry) => {
              if (typeof entry === "string") return { name: entry };
              if (!entry?.name) return null;
              return {
                name: entry.name,
                ...(entry.icon ? { icon: entry.icon } : {}),
                ...(entry.color ? { color: entry.color } : {}),
                ...(entry.category ? { category: entry.category } : {}),
              };
            })
            .filter(Boolean);
          return;
        }
        if (f.type === "json" && typeof body[f.name] === "string" && body[f.name]) {
          body[f.name] = JSON.parse(body[f.name]);
        }
        if (f.type === "number" && body[f.name] !== "") {
          body[f.name] = Number(body[f.name]);
        }
      });
      await api.create(body);
      setForm(Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""])));
      await load();
      setStatus("Created.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  async function onDelete(id) {
    await api.remove(id);
    await load();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(needle),
    );
  }, [items, query]);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Content"
        title={title}
        lead={lead || `Create and manage ${title.toLowerCase()} entries.`}
      />

      <Panel
        title={`Add ${title.replace(/s$/, "")}`}
        meta="Required fields are marked with an asterisk"
      >
        <form className="form form--grid" onSubmit={onCreate}>
          {fields.map((f) =>
            f.type === "checkbox" ? (
              <Toggle
                key={f.name}
                name={f.name}
                checked={!!form[f.name]}
                onChange={onChange}
                label={labelize(f.name)}
              />
            ) : f.type === "techStack" ? (
              <TechStackField
                key={f.name}
                name={f.name}
                label={labelize(f.name)}
                value={form[f.name] || "[]"}
                onChange={onChange}
                hint={f.hint}
              />
            ) : (
              <Field
                key={f.name}
                label={labelize(f.name)}
                name={f.name}
                type={
                  f.type === "textarea" || f.type === "json"
                    ? "textarea"
                    : f.type === "number"
                      ? "number"
                      : "text"
                }
                value={form[f.name]}
                onChange={onChange}
                required={required.includes(f.name)}
                placeholder={f.placeholder}
                rows={f.type === "json" ? 3 : f.type === "textarea" ? 4 : undefined}
                mono={f.type === "json"}
                hint={f.type === "json" ? "JSON value — keep valid syntax" : undefined}
              />
            ),
          )}
          <div className="form__footer form__span-full">
            <button type="submit" className="btn">
              <Plus size={16} aria-hidden="true" />
              Add
            </button>
            <StatusBanner status={status} />
          </div>
        </form>
      </Panel>

      <Panel title="Entries" meta={`${items.length} total`} flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <SearchToolbar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              countLabel={`${filtered.length} shown`}
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title={items.length === 0 ? `No ${title.toLowerCase()} yet` : "No matches"}
                detail={
                  items.length === 0
                    ? "Add your first entry using the form above."
                    : "Try a different search term."
                }
              />
            ) : (
              <ul className="list">
                {filtered.map((item) => (
                  <li key={item.id} className="list__item">
                    <div>
                      <strong>
                        {item.title ||
                          item.company ||
                          item.school ||
                          item.platform ||
                          item.id}
                      </strong>
                      <p>
                        {item.summary ||
                          item.role ||
                          item.degree ||
                          item.url ||
                          item.issuer ||
                          item.slug ||
                          ""}
                      </p>
                    </div>
                    <div className="list__actions">
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </section>
  );
}

export default ResourcePage;
