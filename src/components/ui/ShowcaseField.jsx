/* Desktop / tablet / mobile showcase frames for project detail. */
import { FileUpload } from "./FileUpload";
import "./GalleryField.css";

const SLOTS = [
  { key: "desktop", label: "Desktop" },
  { key: "tablet", label: "Tablet" },
  { key: "mobile", label: "Mobile" },
];

function slotValue(value, key) {
  const raw = value?.[key];
  if (typeof raw === "string") return { src: raw, alt: "" };
  if (raw && typeof raw === "object") {
    return { src: raw.src || "", alt: raw.alt || "" };
  }
  return { src: "", alt: "" };
}

export function ShowcaseField({
  label = "Responsive showcase",
  value = {},
  onChange,
  hint = "Optional frames for the detail page responsive section.",
}) {
  function updateSlot(key, patch) {
    const current = slotValue(value, key);
    onChange?.({
      ...value,
      [key]: { ...current, ...patch },
    });
  }

  return (
    <div className="gallery-field form__span-full">
      <div className="gallery-field__head">
        <span className="form__label">{label}</span>
      </div>
      {hint ? <p className="form__hint">{hint}</p> : null}

      <ul className="gallery-field__list">
        {SLOTS.map((slot) => {
          const item = slotValue(value, slot.key);
          return (
            <li key={slot.key} className="gallery-field__slot">
              <div className="gallery-field__slot-head">
                <strong>{slot.label}</strong>
              </div>
              <FileUpload
                label=""
                value={item.src}
                accept="image/*"
                onChange={(url) => updateSlot(slot.key, { src: url })}
                full
              />
              <label className="form__field">
                <span className="form__label">Alt text</span>
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => updateSlot(slot.key, { alt: e.target.value })}
                  placeholder={`${slot.label} screenshot`}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
