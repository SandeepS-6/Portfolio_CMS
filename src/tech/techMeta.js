/*
  CMS copy of frontend techTone lookup — keep names/icons in sync by hand.
  Used so the admin can preview Simple Icons without importing the portfolio app.
*/
const TECH_META = {
  React: { icon: "react", color: "61DAFB" },
  TypeScript: { icon: "typescript", color: "3178C6" },
  JavaScript: { icon: "javascript", color: "F7DF1E" },
  Vite: { icon: "vite", color: "646CFF" },
  Tailwind: { icon: "tailwindcss", color: "06B6D4" },
  "Tailwind CSS": { icon: "tailwindcss", color: "06B6D4" },
  "Next.js": { icon: "nextdotjs", color: "E2E8F0" },
  Next: { icon: "nextdotjs", color: "E2E8F0" },
  Node: { icon: "nodedotjs", color: "8CC84B" },
  "Node.js": { icon: "nodedotjs", color: "8CC84B" },
  Express: { icon: "express", color: "E2E8F0" },
  MongoDB: { icon: "mongodb", color: "47A248" },
  PostgreSQL: { icon: "postgresql", color: "4169E1" },
  Postgres: { icon: "postgresql", color: "4169E1" },
  Redis: { icon: "redis", color: "DC382D" },
  GSAP: { icon: "greensock", color: "88CE02" },
  MDX: { icon: "mdx", color: "F0ABFC" },
  Algolia: { icon: "algolia", color: "5468FF" },
  Recharts: { icon: "chartdotjs", color: "FF6384" },
  CSS: { icon: "css", color: "1572B6" },
  "CSS Modules": { icon: "cssmodules", color: "E2E8F0" },
  Storybook: { icon: "storybook", color: "FF4785" },
  "Socket.io": { icon: "socketdotio", color: "E2E8F0" },
  Python: { icon: "python", color: "3776AB" },
  Prisma: { icon: "prisma", color: "E2E8F0" },
  GraphQL: { icon: "graphql", color: "E10098" },
  Docker: { icon: "docker", color: "2496ED" },
  AWS: { icon: "amazonwebservices", color: "FF9900" },
  Firebase: { icon: "firebase", color: "FFCA28" },
  Supabase: { icon: "supabase", color: "3ECF8E" },
  Figma: { icon: "figma", color: "F24E1E" },
  HTML: { icon: "html5", color: "E34F26" },
  HTML5: { icon: "html5", color: "E34F26" },
  Sass: { icon: "sass", color: "CC6699" },
  Redux: { icon: "redux", color: "764ABC" },
  Framer: { icon: "framer", color: "0055FF" },
  "Framer Motion": { icon: "framer", color: "0055FF" },
  IndexedDB: { icon: "indexeddb", color: "E2E8F0" },
};

const TECH_META_BY_KEY = Object.fromEntries(
  Object.entries(TECH_META).map(([name, meta]) => [normalizeKey(name), meta]),
);

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s._-]+/g, "");
}

export function guessTechIcon(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const known = TECH_META_BY_KEY[normalizeKey(raw)];
  if (known?.icon) return known.icon;
  return raw
    .trim()
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/\./g, "dot")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function lookupTechMeta(name) {
  return TECH_META_BY_KEY[normalizeKey(name)] || null;
}

export const TECH_SUGGESTIONS = Object.keys(TECH_META);
