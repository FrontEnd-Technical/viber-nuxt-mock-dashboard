# Hotel Admin SPA

Starter frontend for a hotel-management dashboard using Nuxt 4, Vuetify, Pinia and Nuxt data fetching.

## Requirements

- Node.js 22.22.3+, 24.15.0+, or 26+
- npm

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure the public API origin:

```env
NUXT_PUBLIC_API_BASE=https://api.example.com
```

The dashboard currently uses the example Nitro endpoint at `/api/dashboard`. Set the API origin and replace that endpoint when connecting the production hotel-management API.

## Project structure

```text
app/
  assets/css/           Global design tokens and responsive styles
  components/
    dashboard/          KPI and chart components
    shared/             Components shared by pages
  layouts/              Shared admin shell and navigation
  pages/                File-based SPA routes
  stores/               Pinia domain state
server/api/              Local example API endpoint (Nitro)
shared/types/            Types shared by app and server
DESIGN.md                Shared design rules based on the Figma reference
```

Nuxt 4's `app/` directory keeps browser application code separate from Nitro's `server/` and cross-runtime `shared/` code. As the project grows, organize domain-specific components, composables and services by feature under `app/`; keep only genuinely reusable pieces in `app/components/shared`.

## Data flow

- Use `useFetch` for page-level, reactive reads that should participate in Nuxt's request/data lifecycle.
- Use `$fetch` for explicit interactions and Pinia actions (for example refreshing dashboard data or submitting mutations).
- Keep API response types in `shared/types/`; move endpoint-specific calls into `app/services/` when multiple pages begin using the same domain API.
- Pinia owns shared client state; avoid copying all `useFetch` response state into Pinia unless it must be shared between routes.

## Scripts

- `npm run dev` — local development server
- `npm run typecheck` — Nuxt type check
- `npm run build` — production build
- `npm run generate` — static generation
- `npm run preview` — preview a production build

# Mock Api System
All api system provider by https://github.com/BackEnd-Technical/viber-spring-mockapi.git