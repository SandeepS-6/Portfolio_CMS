/*
  Multi-image field for project cards + gallery.
  Value is [{ src, alt }] — portfolio rotates the first 3 one-by-one on cards.
*/
import { Plus, Trash2 } from "lucide-react";
import { FileUpload } from "./FileUpload";
import "./GalleryField.css";

const MAX_IMAGES = 6;

function normalizeItems(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return { src: entry, alt: "" };
      if (entry?.src) return { src: entry.src, alt: entry.alt || "" };
      return null;
    })
    .filter(Boolean);
}

export function GalleryField({
  name = "gallery",
  label = "Project images",
  value = [],
  onChange,
  hint = "Add 2–3 images for the card slideshow (shown one by one). Extra images appear in the detail gallery.",
  max = MAX_IMAGES,
}) {
  const items = normalizeItems(value);

  function update(next) {
    onChange?.(next);
  }

  function updateItem(index, patch) {
    update(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addSlot() {
    if (items.length >= max) return;
    update([...items, { src: "", alt: "" }]);
  }

  function removeSlot(index) {
    update(items.filter((_, i) => i !== index));
  }

  return (
    <div className="gallery-field form__span-full">
      <div className="gallery-field__head">
        <span className="form__label">{label}</span>
        <span className="gallery-field__count">
          {items.length}/{max}
        </span>
      </div>

      {hint ? <p className="form__hint">{hint}</p> : null}

      <ul className="gallery-field__list">
        {items.map((item, index) => (
          <li key={`${name}-${index}`} className="gallery-field__slot">
            <div className="gallery-field__slot-head">
              <strong>
                Image {index + 1}
                {index === 0 ? " · cover" : ""}
                {index < 3 ? " · card rotate" : ""}
              </strong>
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => removeSlot(index)}
              >
                <Trash2 size={14} aria-hidden="true" />
                Remove
              </button>
            </div>

            <FileUpload
              label=""
              value={item.src || ""}
              accept="image/*"
              onChange={(url) => updateItem(index, { src: url })}
              full
            />

            <label className="form__field">
              <span className="form__label">Alt text</span>
              <input
                type="text"
                value={item.alt || ""}
                onChange={(e) => updateItem(index, { alt: e.target.value })}
                placeholder="Short description of the image"
              />
            </label>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="gallery-field__empty">No images yet — add at least one.</p>
      ) : null}

      {items.length < max ? (
        <button type="button" className="btn btn--sm" onClick={addSlot}>
          <Plus size={14} aria-hidden="true" />
          Add image
        </button>
      ) : null}
    </div>
  );
}
