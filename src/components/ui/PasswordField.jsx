import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({
  label = "Password",
  name = "password",
  value,
  onChange,
  required = false,
  autoComplete = "current-password",
  placeholder,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="form__field">
      <span className="form__label">
        {label}
        {required ? (
          <span className="form__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>

      <div className="field-password">
        <input
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="field-password__toggle"
          onClick={() => setVisible((open) => !open)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    </label>
  );
}
