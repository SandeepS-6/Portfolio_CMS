import { statusTone } from "./labelize";

export function StatusBanner({ status }) {
  if (!status) return null;
  const tone = statusTone(status);
  return (
    <p className={`form__status form__status--${tone} toast--${tone}`}>{status}</p>
  );
}
