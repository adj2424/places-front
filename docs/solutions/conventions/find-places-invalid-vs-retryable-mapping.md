---
title: "Map Places HTTP failures by status, JSON shape, and address vs coordinates — not error text"
date: 2026-08-26
category: conventions
module: places
problem_type: convention
component: frontend_stimulus
severity: medium
applies_when:
  - "Classifying POST /find-places HTTP misses in the browser client"
  - "Choosing PlaceList copy for invalid vs retryable vs empty success"
  - "Debugging a gibberish address that still shows retryable copy"
  - "Clearing map notice so a Nominatim miss cannot outlive a failed list"
related_components:
  - "development_workflow"
  - "documentation"
tags:
  - "find-places"
  - "invalid-search"
  - "retryable-failure"
  - "http-400"
  - "http-500-html"
  - "placelist"
  - "error-mapping"
---

# Map Places HTTP failures by status, JSON shape, and address vs coordinates — not error text

## Context

Nearby explorer’s Results panel used to collapse every Places miss into one retryable path. Product meaning in `CONCEPTS.md` already distinguishes **Invalid search** (Places could not use the request, typically an address it cannot geocode) from **Retryable failure** (Places or the network could not complete a search the UI already treated as valid to send), and both from a **successful empty list**.

The uncommitted working tree (as of this writing) implements that split. `FindPlacesFailure.kind` is `'retryable' | 'invalid'` (`src/places/types.ts:35-38`). `PlaceListStatus` includes `'invalid'` and `'error'` (`src/results/PlaceList.tsx:3`). `App` maps client `invalid` to list status `'invalid'` and every other failure to `'error'` (`src/App.tsx:90-96`). Committed HEAD still has retryable-only failures; prefer the live files over snapshot plans when they disagree.

A live debug session showed why matching Places error *text* and treating “gibberish address” as always invalid is unsafe. (session history) Places answered with **500 HTML** rather than 400 JSON `{ error: string }`, so this client correctly treated the miss as retryable. The durable rule is: only address-mode **400 + object payload + string `error`** is invalid; everything else that is not a valid 200 payload is retryable. Do not treat a nonsense address as invalid unless that HTTP shape arrived.

The search-area map geocode (Nominatim) is independent of Places. A Places failure must not surface the map-miss notice meant for “Places succeeded but Nominatim could not place the address.”

## Guidance

### Three Results outcomes, not two

Keep three user-visible outcomes after a submitted search:

1. **Invalid search** — Results status `'invalid'`. Copy: “We couldn’t find that address. Check the spelling and try again.” (`src/results/PlaceList.tsx:34-42`). No Retry button; form submit is the retry.
2. **Retryable failure** — Results status `'error'`. Copy: “Search couldn’t be completed. Try again in a moment.” (`src/results/PlaceList.tsx:45-53`).
3. **Empty success** — Results status `'success'` with `places.length === 0`. Copy: “No places found in this area.” (`src/results/PlaceList.tsx:56-65`). This is not an error.

Do not reuse `'error'` for unusable addresses, and do not treat an empty 200 as invalid.

### Classify in `findPlaces` by status, shape, and request mode — never by error text

`failureKind` (`src/places/find-places-client.ts:36-54`) returns `'invalid'` only when **all** of these hold:

- HTTP status is exactly `400` (any other status → `'retryable'`, lines 41-43)
- JSON payload is a non-null object (non-object / failed parse → `'retryable'`, lines 44-46)
- `payload.error` is a **string** (arrays, missing field, non-strings → `'retryable'`, lines 47-49)
- the request is address-mode (`'address' in body`, lines 24-26 and 50-52)

Otherwise `'retryable'`. Coordinates-mode 400 with a string `error` is still retryable.

On `!response.ok`, `findPlaces` returns `{ ok: false, kind: failureKind(...) }` and does not pass Places `error` strings to the UI (`src/places/find-places-client.ts:66-68`). Malformed 200 bodies are retryable (`src/places/find-places-client.ts:71-86`). The outer `catch` around `fetch` is retryable (`src/places/find-places-client.ts:89-91`).

PlaceList owns the two failure sentences. Do not render Places payload text.

### App wiring: map `kind`, clear map notice on Places failure

After `findPlaces` returns and the request generation is still current (`src/App.tsx:85-96`):

- `result.kind === 'invalid'` → `setStatus('invalid')`
- else → `setStatus('error')`
- always `setPlaces([])`, `setTotal(null)`, `searchFlags.current.placesOk = false`, `setMapNotice(null)`

`MAP_MISS_NOTICE` is only shown when Places succeeded **and** Nominatim missed (`src/App.tsx:14-15`, `44-51`, `99-103`). Nominatim does not classify Places failures.

## Why This Matters

- **Wrong bucket trains the user the wrong action.** Invalid search asks for a different address; retryable failure asks to wait and resubmit; empty success says the area has no matches.
- **Error-text classifiers rot.** Places wording and HTML bodies are not a contract. Status 400 + JSON shape is the stable signal on this client.
- **All-400-as-invalid is too wide.** Coordinates-mode 400 and 400 with `error` as an array stay retryable.
- **Independent geocoders.** Showing “Search results are still shown” after Places failed implies results exist. Clearing `mapNotice` on failure (`src/App.tsx:95`) and gating the notice on `placesOk === true` (`src/App.tsx:49-50`) keeps those stories apart.

## When to Apply

- Adding or changing Places HTTP error handling, `FindPlacesResult`, or Results status.
- Debugging “gibberish address looked retryable” or “map said results are still shown but the list is an error.”
- Touching Nominatim display geocode vs Places `POST /find-places` — keep them independent.
- Reading `CONCEPTS.md` vs git: product meaning includes Invalid search; committed HEAD may still be retryable-only until this working tree is committed.

## Examples

### Invalid vs retryable vs empty success

| Situation | Client result | PlaceList status | User-facing copy |
| --- | --- | --- | --- |
| Address search, HTTP 400, JSON `{ error: "<any string>" }` | `{ ok: false, kind: 'invalid' }` | `'invalid'` | Couldn’t find that address… |
| Address search, HTTP 500 HTML / non-JSON | `{ ok: false, kind: 'retryable' }` | `'error'` | Search couldn’t be completed… |
| Address search, HTTP 400, `{ error: [] }` | `{ ok: false, kind: 'retryable' }` | `'error'` | Search couldn’t be completed… |
| Coordinates search, HTTP 400, `{ error: string }` | `{ ok: false, kind: 'retryable' }` | `'error'` | Search couldn’t be completed… |
| `fetch` throws (network / CORS) | `{ ok: false, kind: 'retryable' }` | `'error'` | Search couldn’t be completed… |
| HTTP 200, `places: []`, `total: 0` | `{ ok: true, data: { places: [], total: 0 } }` | `'success'` | No places found in this area. |

### What did not work (live trap)

- **Classify by error text.** Matching backend strings couples the UI to Places wording. `failureKind` never inspects string contents—only `typeof ... === 'string'` (`src/places/find-places-client.ts:47-48`).
- **Treat all 400 as invalid.** Coordinates-mode 400 with a string error is retryable (`src/places/find-places-client.ts:50-52`).
- **Assume a bad-looking address is invalid.** (session history) Places returned 500 HTML instead of 400 JSON. This client only treats **400 JSON** with a string `error` in **address mode** as invalid. Until that shape arrives, the list will show retryable copy even for nonsense addresses.

### Map notice vs Places failure

Places fail → `placesOk = false`; `setMapNotice(null)`; status `invalid` or `error`. Places succeed and Nominatim miss → `MAP_MISS_NOTICE`. Do not set the miss notice while Places is in flight or already failed (`src/App.tsx:44-51`, `90-96`, `99-103`).

## Related

- [Vite listens on 3000; Places client defaults to 3001](../tooling-decisions/vite-default-port-3000-places-on-3001.md) — same client file and CORS/HTML debugging, different problem (ports, not kind mapping).
- [Leaflet Circle.getBounds crashes when the layer is not on the map](../runtime-errors/leaflet-circle-getbounds-unmapped-layer.md) — map fit crash; Places HTTP kinds are unrelated.
