/** Resolve /uploads/... against the API host; leave public/absolute paths alone. */
export function mediaUrl(src) {
  if (!src || typeof src !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("/uploads/")) {
    const base = String(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
      /\/$/,
      "",
    );
    return `${base}${src}`;
  }
  return src;
}
