# Nearby explorer

A local browser UI for the sibling [Places](../places) service. Search nearby places from an address or your current location, then call or open an address in maps.

This app talks to Places **directly** from the browser. It does not add a Vite proxy.

## Run locally

1. Start Places on port 3000 from the sibling repo:

   ```bash
   cd ../places
   npm run dev
   ```

2. Enable a browser CORS plugin for localhost so `http://127.0.0.1:5173` can `fetch` `http://127.0.0.1:3000`.

3. Start this frontend:

   ```bash
   npm install
   npm run dev
   ```

Optional: set `VITE_PLACES_BASE_URL` if Places is not at `http://127.0.0.1:3000`.

## Scripts

- `npm run dev` — Vite dev server
- `npm test` — Vitest (search contract)
- `npm run lint` — ESLint
- `npm run build` — typecheck and production build
