# PX Recipe Book

Read-only recipe reference app for Panda Express kitchen staff. Pulls all data live from the main [PRG Batch System](https://github.com/evahba/prg-batch-system-2.0) API.

**Live site:** [lighthearted-gingersnap-8a27b9.netlify.app](https://lighthearted-gingersnap-8a27b9.netlify.app)  
**API / data source:** [3847sst.kuftyrev.cloud](https://3847sst.kuftyrev.cloud)

---

## Stack

| | |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| HTTP | Axios |
| Icons | Lucide React |
| Hosting | Netlify (auto-deploy from `main`) |

---

## Features

- **Recipe book grid** — all menu items grouped by category (Entrées, Appetizers, Sides, Cooking Sauces, Other)
- **Search** — by name, code, or ingredient
- **Allergen filter** — exclude allergens to see only safe items
- **Recipe page** — ingredients, batch selector, execution steps, best practices, quality checks, comparisons, nutrition info
- **Batch selector** — switch between batch sizes (1/2, 1, 2, Catering) on the ingredient table
- **Prev / Next navigation** — arrows at the bottom of each recipe page
- **Category breadcrumb** — shows section + subcategory in the header
- **Image skeleton** — shimmer placeholder while images load
- **Session persistence** — search, allergen filter, and scroll position survive navigation within the session
- **Password gate** — simple PIN protection (`1565`) stored in `localStorage`

---

## Local Development

The main API must be running on port 3001 first:

```bash
# From prg-batch-system-2.0
docker compose up -d db
cd api && npm run dev
```

Then:

```bash
npm install
npm run dev
# → http://localhost:5200
```

Vite dev server proxies `/api/*` and `/uploads/*` → `http://localhost:3001`.

---

## Netlify Deployment

Auto-deploys on every push to `main`.

**Required environment variable** (Netlify → Site Settings → Environment Variables):

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://3847sst.kuftyrev.cloud` |

After changing the env var, trigger **Clear cache and deploy** for it to take effect.

Build config is in `netlify.toml` — picked up automatically.

---

## Project Structure

```
src/
├── components/
│   └── FadeImage.tsx       # Shimmer skeleton + fade-in image wrapper
├── store/
│   └── useMenuStore.ts     # Zustand store — fetches /api/menu/all, caches in memory
├── lib/
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
├── RecipeBook.tsx           # Main grid page — categories, search, allergen filter
├── RecipePage.tsx           # Individual recipe — ingredients, steps, best practices, quality
├── PasswordGate.tsx         # PIN gate (localStorage)
├── main.tsx                 # Entry point — manual routing (/ vs /recipes/:code)
└── App.tsx                  # Unused shell (kept for Vite convention)
```

---

## Data

All data is fetched once on mount from `GET /api/menu/all` and cached in the Zustand store for the session. No real-time sync — refresh to get the latest data.

Images are served from `https://3847sst.kuftyrev.cloud/uploads/` (dish thumbnails) and sub-paths for best practices, quality checks, etc.

If Cloudflare is caching stale responses for new image URLs, purge the cache in the Cloudflare dashboard.
