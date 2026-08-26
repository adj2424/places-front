# Nearby explorer

A local browser UI for the sibling [Places](../places) service. Search nearby places from an address or your current location, then call or open an address in maps.

This app talks to Places **directly** from the browser. It does not add a Vite proxy.

## Run locally

1. Start Places on port 3001 from the sibling repo (its own default may still be 3000; this app’s Vite server uses 3000):

   ```bash
   cd ../places
   PORT=3001 npm run dev
   ```

   PowerShell: `cd ../places; $env:PORT='3001'; npm run dev`

2. Enable a browser CORS plugin for localhost so `http://127.0.0.1:3000` can `fetch` `http://127.0.0.1:3001`.

3. Start this frontend:

   ```bash
   npm install
   npm run dev
   ```

Optional: set `VITE_PLACES_BASE_URL` if Places is not at `http://127.0.0.1:3001`. Do not point it at port 3000 while this app is also on 3000.

## Docs

- **[AGENTS.md](./AGENTS.md)** — how humans and coding agents add features
- **[docs/architecture.md](./docs/architecture.md)** — live folder map
- **[CONCEPTS.md](./CONCEPTS.md)** — shared vocabulary

## Scripts

- `npm run dev` — Vite dev server
- `npm test` — Vitest (colocated contract tests)
- `npm run lint` — ESLint
- `npm run build` — typecheck and production build
