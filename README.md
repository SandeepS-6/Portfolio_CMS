# Portfolio CMS

Separate React admin app (port **5174**).

## Folders

| Folder | Why |
|--------|-----|
| `components/` | Reusable UI (forms, tables, buttons) |
| `pages/` | One screen per module (Skills, Projects, …) |
| `services/` | Axios calls to `/api/...` only |
| `hooks/` | Shared React logic |
| `layouts/` | Admin shell (sidebar later) |
| `assets/` | Images/icons |
| `styles/` | Global CMS styles |

## Run

```bash
cd cms
npm install
npm run dev
```

No database access from here — only REST APIs.
