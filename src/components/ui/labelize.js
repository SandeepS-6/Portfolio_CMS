export function labelize(name = "") {
  return String(name)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function statusTone(status) {
  if (!status) return "";
  const value = String(status).toLowerCase();
  if (
    value.includes("saving") ||
    value.includes("creating") ||
    value.includes("loading")
  ) {
    return "pending";
  }
  if (
    value === "saved." ||
    value === "created." ||
    value.endsWith("saved.") ||
    value.endsWith("created.")
  ) {
    return "success";
  }
  return "error";
}
