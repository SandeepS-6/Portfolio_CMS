import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  EmptyState,
  Field,
  FileUpload,
  GalleryField,
  ShowcaseField,
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

function defaultForField(f) {
  if (f.defaultValue !== undefined) return f.defaultValue;
  if (f.type === "gallery") return [];
  if (f.type === "showcase") {
    return {
      desktop: { src: "", alt: "" },
      tablet: { src: "", alt: "" },
      mobile: { src: "", alt: "" },
    };
  }
  if (f.type === "checkbox") return false;
  return "";
}

function blankForm(fields) {
  return Object.fromEntries(fields.map((f) => [f.name, defaultForField(f)]));
}

function itemToForm(item, fields) {
  const next = blankForm(fields);
  for (const f of fields) {
    const val = item[f.name];
    if (f.type === "techStack") {
      const stack = Array.isArray(item.techDetails) && item.techDetails.length
        ? item.techDetails
        : item.techStack || [];
      next[f.name] = JSON.stringify(stack);
    } else if (f.type === "json") {
      const fallback = f.defaultValue !== undefined ? f.defaultValue : "[]";
      next[f.name] =
        val === undefined || val === null
          ? typeof fallback === "string"
            ? fallback
            : JSON.stringify(fallback)
          : JSON.stringify(val, null, 2);
    } else if (f.type === "gallery") {
      next[f.name] = Array.isArray(val) ? val : [];
    } else if (f.type === "showcase") {
      next[f.name] =
        val && typeof val === "object"
          ? val
          : defaultForField(f);
    } else if (f.type === "checkbox") {
      next[f.name] = !!val;
    } else if (f.type === "number") {
      next[f.name] = val === null || val === undefined ? "" : val;
    } else {
      next[f.name] = val ?? "";
    }
  }
  return next;
}

function ResourcePage({ title, api, fields, required = [], lead }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(() => blankForm(fields));
  const [editingId, setEditingId] = useState(null);
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

  function setFormField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm(fields));
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm(itemToForm(item, fields));
    setStatus(`Editing: ${item.title || item.company || item.slug || item.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildBody() {
    const body = { ...form };
    fields.forEach((f) => {
      if (f.type === "techStack") {
        const stackItems = parseTechStackField(body[f.name]);
        body.techStack = stackItems
          .map((entry) => (typeof entry === "string" ? entry : entry?.name))
          .filter(Boolean);
        body.techDetails = stackItems
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
      if (f.type === "gallery") {
        const gallery = (Array.isArray(body[f.name]) ? body[f.name] : [])
          .filter((item) => item?.src)
          .map(({ src, alt }) => ({ src, alt: alt || "" }));
        body[f.name] = gallery;
        if (gallery[0]?.src) {
          body.coverImage = gallery[0].src;
          body.coverAlt = gallery[0].alt || body.coverAlt || "";
        } else {
          body.coverImage = body.coverImage || "";
        }
        return;
      }
      if (f.type === "showcase") {
        const raw = body[f.name] && typeof body[f.name] === "object" ? body[f.name] : {};
        const next = {};
        for (const slot of ["desktop", "tablet", "mobile"]) {
          const src =
            typeof raw[slot] === "string" ? raw[slot] : raw[slot]?.src || "";
          if (!src) continue;
          next[slot] = {
            src,
            alt: raw[slot]?.alt || slot,
          };
        }
        body[f.name] = next;
        return;
      }
      if (f.type === "json" && typeof body[f.name] === "string" && body[f.name]) {
        body[f.name] = JSON.parse(body[f.name]);
      }
      if (f.type === "number" && body[f.name] !== "") {
        body[f.name] = Number(body[f.name]);
      }
      if (f.type === "number" && body[f.name] === "") {
        body[f.name] = null;
      }
    });
    return body;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const body = buildBody();
      if (editingId) {
        if (!api.update) throw new Error("Update is not available for this resource.");
        await api.update(editingId, body);
        setStatus("Updated.");
      } else {
        await api.create(body);
        setStatus("Created.");
      }
      resetForm();
      await load();
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  async function onDelete(id) {
    await api.remove(id);
    if (editingId === id) resetForm();
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
        title={
          editingId
            ? `Edit ${title.replace(/s$/, "")}`
            : `Add ${title.replace(/s$/, "")}`
        }
        meta="Required fields are marked with an asterisk"
      >
        <form className="form form--grid" onSubmit={onSubmit}>
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
            ) : f.type === "gallery" ? (
              <GalleryField
                key={f.name}
                name={f.name}
                label={f.label || labelize(f.name)}
                value={form[f.name] || []}
                onChange={(next) => setFormField(f.name, next)}
                hint={f.hint}
                max={f.max}
              />
            ) : f.type === "showcase" ? (
              <ShowcaseField
                key={f.name}
                label={f.label || labelize(f.name)}
                value={form[f.name] || {}}
                onChange={(next) => setFormField(f.name, next)}
                hint={f.hint}
              />
            ) : f.type === "image" || f.type === "file" ? (
              <FileUpload
                key={f.name}
                label={labelize(f.name)}
                value={form[f.name] || ""}
                accept={f.type === "file" ? "application/pdf,image/*" : "image/*"}
                onChange={(url) => setFormField(f.name, url)}
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
              {editingId ? "Save changes" : "Add"}
            </button>
            {editingId ? (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                <X size={16} aria-hidden="true" />
                Cancel
              </button>
            ) : null}
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
                        {Array.isArray(item.gallery) && item.gallery.length > 0
                          ? ` · ${item.gallery.length} image${item.gallery.length === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                    <div className="list__actions">
                      {api.update ? (
                        <button
                          type="button"
                          className="btn btn--sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                      ) : null}
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
