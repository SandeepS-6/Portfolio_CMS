/*
  Project tech stack chips for CMS.
  Saves names (+ optional Simple Icons slug). Backend keeps String[] for
  techStack; icon overrides ride along in techDetails without schema changes.
*/
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  guessTechIcon,
  lookupTechMeta,
  TECH_SUGGESTIONS,
} from "../tech/techMeta";
import "./TechStackField.css";

function parseItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (typeof entry === "string") {
          const meta = lookupTechMeta(entry) || {};
          return {
            name: entry,
            icon: meta.icon || guessTechIcon(entry),
          };
        }
        const name = entry?.name || "";
        if (!name) return null;
        const meta = lookupTechMeta(name) || {};
        return {
          name,
          icon: entry?.icon || meta.icon || guessTechIcon(name),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function emitChange(name, items, onChange) {
  onChange?.({
    target: {
      name,
      value: JSON.stringify(items),
      type: "text",
    },
  });
}

export function TechStackField({
  name = "techStack",
  label = "Tech stack",
  value = "[]",
  onChange,
  hint = "Type a tech name — the icon resolves automatically. Override the slug if needed.",
}) {
  const items = useMemo(() => parseItems(value), [value]);
  const [draft, setDraft] = useState("");
  const [iconDraft, setIconDraft] = useState("");

  const previewIcon = iconDraft.trim() || guessTechIcon(draft);
  const previewUrl = previewIcon
    ? `https://cdn.simpleicons.org/${previewIcon}/2a2a32`
    : null;

  const suggestions = useMemo(() => {
    const needle = draft.trim().toLowerCase();
    if (!needle) return TECH_SUGGESTIONS.slice(0, 8);
    return TECH_SUGGESTIONS.filter((entry) =>
      entry.toLowerCase().includes(needle),
    ).slice(0, 8);
  }, [draft]);

  function addItem(rawName, rawIcon) {
    const nextName = String(rawName || "").trim();
    if (!nextName) return;
    if (items.some((item) => item.name.toLowerCase() === nextName.toLowerCase())) {
      setDraft("");
      setIconDraft("");
      return;
    }

    const meta = lookupTechMeta(nextName) || {};
    const next = [
      ...items,
      {
        name: nextName,
        icon: (rawIcon || iconDraft || meta.icon || guessTechIcon(nextName)).trim(),
      },
    ];
    emitChange(name, next, onChange);
    setDraft("");
    setIconDraft("");
  }

  function removeItem(techName) {
    emitChange(
      name,
      items.filter((item) => item.name !== techName),
      onChange,
    );
  }

  function updateIcon(techName, nextIcon) {
    emitChange(
      name,
      items.map((item) =>
        item.name === techName ? { ...item, icon: nextIcon.trim() } : item,
      ),
      onChange,
    );
  }

  function onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(draft, iconDraft);
  }

  return (
    <div className="form__field form__span-full tech-stack-field">
      {label ? <span className="form__label">{label}</span> : null}

      <div className="tech-stack-field__chips">
        {items.length === 0 ? (
          <p className="tech-stack-field__empty">No tech added yet.</p>
        ) : (
          items.map((item) => {
            const iconUrl = item.icon
              ? `https://cdn.simpleicons.org/${item.icon}/2a2a32`
              : null;
            return (
              <div key={item.name} className="tech-stack-field__chip">
                {iconUrl ? (
                  <img
                    className="tech-stack-field__chip-icon"
                    src={iconUrl}
                    alt=""
                    width="14"
                    height="14"
                    loading="lazy"
                  />
                ) : null}
                <span className="tech-stack-field__chip-name">{item.name}</span>
                <input
                  className="tech-stack-field__chip-slug"
                  value={item.icon || ""}
                  onChange={(e) => updateIcon(item.name, e.target.value)}
                  placeholder="icon slug"
                  aria-label={`${item.name} icon slug`}
                  title="Simple Icons slug"
                />
                <button
                  type="button"
                  className="tech-stack-field__remove"
                  onClick={() => removeItem(item.name)}
                  aria-label={`Remove ${item.name}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="tech-stack-field__add">
        <div className="tech-stack-field__inputs">
          <input
            value={draft}
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              setIconDraft((prev) => {
                const autoPrev = guessTechIcon(draft);
                if (!prev || prev === autoPrev) return guessTechIcon(next);
                return prev;
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem(draft, iconDraft);
              }
            }}
            placeholder="e.g. React"
            list={`${name}-suggestions`}
          />
          <input
            value={iconDraft}
            onChange={(e) => setIconDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem(draft, iconDraft);
              }
            }}
            placeholder="icon slug (auto)"
          />
        </div>

        <div className="tech-stack-field__preview" aria-hidden="true">
          {previewUrl ? (
            <img src={previewUrl} alt="" width="18" height="18" />
          ) : (
            <span className="tech-stack-field__preview-empty">?</span>
          )}
        </div>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onSubmit}
        >
          <Plus size={14} aria-hidden="true" />
          Add
        </button>
      </div>

      <datalist id={`${name}-suggestions`}>
        {suggestions.map((entry) => (
          <option key={entry} value={entry} />
        ))}
      </datalist>

      {hint ? <p className="form__hint">{hint}</p> : null}

      {/* Keep JSON in the form payload ResourcePage already understands */}
      <input type="hidden" name={name} value={JSON.stringify(items)} readOnly />
    </div>
  );
}
