# Architecture

Vite + React nearby-explorer. Feature folders plus `App.tsx` wiring. Not ports-and-adapters.

How to add a feature: [AGENTS.md](../AGENTS.md). Glossary: [CONCEPTS.md](../CONCEPTS.md). Places HTTP fields: sibling [../places/docs/api.md](../../places/docs/api.md).

## Composition

```
src/main.tsx          mount only
    ↓
src/App.tsx           search state, request generation, panel layout
    ├─ src/search/    XOR body, geolocation, category checkboxes
    ├─ src/places/    POST /find-places client, types, catalog keys
    ├─ src/map/       search-area map, Nominatim display geocode
    └─ src/results/   idle / loading / success / error list
```

`src/App.css` holds shared form and panel layout. `src/index.css` is global.

## Folder roles

| Concern | Location | Role |
|---------|----------|------|
| Search form + XOR body | `src/search/` | Build `FindPlacesRequest`. Coordinates or address, not both. Radius 1–50000. Catalog keys, not Google type strings. |
| Places HTTP client | `src/places/` | Browser `fetch` to `VITE_PLACES_BASE_URL` or the default in `find-places-client.ts`. Types and category labels. |
| Search-area map | `src/map/` | Leaflet origin `CircleMarker` plus radius `Circle`. Fit via `boundsForSearchArea`. Nominatim geocode is map origin only. |
| Results list | `src/results/` | Live statuses: `idle`, `loading`, `success`, `error`. Call and open-in-maps links. |
| Wiring | `src/App.tsx` | Generation guard. Origin vs list. Lazy map. |
| Entry | `src/main.tsx` | `createRoot` + `StrictMode`. |
| Tests | colocated `src/<slice>/*.test.ts(x)` | Existing contract tests. |

## Search hops

Coordinates: `App` sets origin immediately and sends lat/lng to Places.

Address: Places receives the address string. Nominatim (`src/map/display-geocode.ts`) resolves map origin in parallel. Nominatim failure can show a map notice while the list still follows the Places result. Do not join these hops or geocode result rows.

`NearbyPlace` has no coordinates. Origin marker is allowed. Result markers are never.

## Places call

Direct browser `fetch` to `POST /find-places`. No Vite proxy. CORS is an operator plugin (README). Field catalog lives in the sibling API doc, not here.

On the committed tree, `FindPlacesFailure.kind` is only `'retryable'`. PlaceList `'error'` is that bucket. Empty 200 is success.

## Snapshots

`docs/plans/` and `docs/solutions/` are history. Living docs plus the live tree win on layout.
