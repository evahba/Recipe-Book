# Recipe Book

Standalone recipe book app for [3847sst.kuftyrev.cloud](https://3847sst.kuftyrev.cloud). Reads data from the same database as the main restaurant management system.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- Zustand (data fetching)
- Deployed on Netlify

## Local Development

The main API must be running on port 3001 first:

```bash
# From the main project
docker compose up -d db
cd api && npm run dev
```

Then start the recipe book:

```bash
npm install
npm run dev
# → http://localhost:5200
```

The Vite dev server proxies:
- `/api`, `/uploads` → `http://localhost:3001`
- `/best-practices`, `/quality-checks`, `/comparisons`, `/execution-issues`, etc. → `https://3847sst.kuftyrev.cloud`

## Netlify Deployment

**Environment variable required** (set in Netlify → Site Settings → Environment Variables):

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://3847sst.kuftyrev.cloud` |

Build settings are in `netlify.toml` — Netlify picks them up automatically.

After changing the env var, trigger a **Clear cache and deploy** for the change to take effect.

## Data Source

All recipe data is fetched once on mount from `/api/menu/all`. To see updated recipes, refresh the page. No real-time sync — the book is read-only.

Images:
- Dish thumbnails → served from `https://3847sst.kuftyrev.cloud/uploads/`
- Recipe images (best practices, quality checks, etc.) → served from `https://3847sst.kuftyrev.cloud/`
