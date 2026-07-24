export function Toggle({ name, checked, onChange, label }) {
  return (
    <label className="form__field form__check">
      <span className="toggle">
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          onChange={onChange}
        />
        <span className="toggle__track" aria-hidden="true" />
      </span>
      <span>{label}</span>
    </label>
  );
}
