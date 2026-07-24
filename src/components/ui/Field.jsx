export function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  hint,
  rows,
  mono = false,
  full = false,
  autoComplete,
}) {
  const isTextarea = type === "textarea" || rows != null;

  return (
    <label className={`form__field${full || isTextarea ? " form__span-full" : ""}`}>
      {label ? (
        <span className="form__label">
          {label}
          {required ? (
            <span className="form__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
      ) : null}

      {isTextarea ? (
        <textarea
          name={name}
          className={mono ? "form__mono" : undefined}
          rows={rows || 4}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}

      {hint ? <p className="form__hint">{hint}</p> : null}
    </label>
  );
}
