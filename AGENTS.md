# AGENTS.md

Portable coding harness for humans and agents. This file is authoritative for how to work in this repo.

## Commands

```bash
npm install            # from committed package.json / package-lock.json only
npm run dev
npm test
npm run lint
npm run build          # tsc -b plus Vite production build
```

There is no `typecheck` script. Typecheck is the `tsc -b` half of `build`. How to run against Places and CORS: [README.md](./README.md).

## Architecture map

| Concern | Location |
| --- | --- |
| Search form + XOR body | `src/search/` |
| Places HTTP client + types + catalog | `src/places/` |
| Search-area map + display geocode | `src/map/` |
| Results list | `src/results/` |
| UI composition / request generation | `src/App.tsx` |
| Process entry | `src/main.tsx` |
| Panel chrome | Tailwind utilities on JSX; theme tokens in `src/index.css` |
| Shared vocabulary | `CONCEPTS.md` |
| Live layout | `docs/architecture.md` |
| Documented solutions | `docs/solutions/` — category folders with YAML frontmatter (`module`, `tags`, `problem_type`); snapshots vs living docs |
| Plans | `docs/plans/` — snapshots |
| Tests | colocated `src/<slice>/*.test.ts(x)` |

Layers and hop roles: [docs/architecture.md](./docs/architecture.md). Places JSON fields: sibling `../places/docs/api.md`.

## Always / Ask first / Never

**Always**

- Add work in the matching live folder and wire cross-panel state only in `src/App.tsx`.
- Keep the search-area map (origin marker + radius circle), not result pins.
- Call Places with browser `fetch` (`VITE_PLACES_BASE_URL` or the default in `src/places/find-places-client.ts`). Do not add a Vite proxy unless the operator asks.
- Run existing `npm test` and `npm run build` before claiming done. Do not add tests to make that step exist.
- Update this file in the same change if top-level `src/` folders, `App.tsx` wiring role, or `package.json` scripts change. Also update `docs/architecture.md` when folders change.

**Ask first**

- Vite proxy or backend CORS changes.
- Result pins or geocoding place rows.
- Hexagonal / `domain` / `service` / `adapters` / `composition` restructure.
- Creating, expanding, or rewriting tests.
- New outbounds besides Places `POST /find-places` and Nominatim display geocode.
- A Google Maps JS key, persistence, auth, deploy, or exposing the app beyond local use.
- Changing Places error mapping or Results failure copy unless this request named that work. Live kinds already include `'invalid'` and `'too-many-types'`.

**Never**

- Create, add, expand, or rewrite test files unless the user explicitly asked for tests in that request. Help means change production code; do not “complete” the work with a new test. Implementing a snapshot plan is not asking for tests.
- Copy sibling `../places` hexagonal AGENTS (`domain` → `service` → `adapters` → `buildApp`, `tests/<slice>/`, `npm run typecheck`).
- Add a Vite proxy to “fix” CORS.
- Add markers for `NearbyPlace` or invent place coordinates.
- Rely on `.cursor/rules` or chat history as the source of truth. Cursor may also load user rules and plugin skills; this file’s Never and numbered recipe still win for this repo.
- Treat orphan `node_modules` as the project stack — install from committed manifests only.
- Treat `docs/plans/` or `docs/solutions/` as the operating recipe.

## Add a feature (numbered recipe)

Point at all four folders plus `App.tsx` — there is no single copy-me feature.

1. Pick the live concern: `search` | `map` | `places` | `results`.
2. Edit files in that folder. Put panel chrome as Tailwind utilities on the markup. Theme tokens live in `src/index.css`.
3. Wire state that crosses map and list only in `src/App.tsx`. Do not add a second composition root.
4. Tests — only if the user asked. Colocate next to the module.
5. Verify — run existing `npm test` and `npm run build`. Do not add tests to make this step exist.
6. If top-level folders, `App.tsx` wiring role, or scripts changed, restate this file in the same change. Also restate `docs/architecture.md` when folders changed.

Exemplars: `src/search/SearchForm.tsx`, `src/places/find-places-client.ts`, `src/map/SearchAreaMap.tsx`, `src/results/PlaceList.tsx`, wiring in `src/App.tsx`.

## Boundaries

- On conflict: **code + package scripts win** for runtime behavior.
- Among living docs: this file’s Never and numbered recipe win for how to add work, including over snapshot plan IUs. [docs/architecture.md](./docs/architecture.md) wins for folder roles. [CONCEPTS.md](./CONCEPTS.md) wins for names. [README.md](./README.md) wins for how to run and CORS. Sibling `../places/docs/api.md` wins for Places JSON.
- `.cursor/rules` and chat are reminders, not the contract.
- `docs/plans/` and `docs/solutions/` are snapshots. Living docs plus the live tree win on layout.
