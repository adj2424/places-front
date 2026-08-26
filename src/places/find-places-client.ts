import type {
  FindPlacesRequest,
  FindPlacesResult,
  NearbyPlace,
} from './types'

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_PLACES_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, '')
  }
  return DEFAULT_BASE_URL
}

function isNearbyPlace(value: unknown): value is NearbyPlace {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return typeof (value as { id?: unknown }).id === 'string'
}

export async function findPlaces(
  body: FindPlacesRequest,
): Promise<FindPlacesResult> {
  try {
    const response = await fetch(`${resolveBaseUrl()}/find-places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return { ok: false, kind: 'retryable' }
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      return { ok: false, kind: 'retryable' }
    }

    if (typeof payload !== 'object' || payload === null) {
      return { ok: false, kind: 'retryable' }
    }

    const { places, total } = payload as { places?: unknown; total?: unknown }
    if (!Array.isArray(places) || typeof total !== 'number') {
      return { ok: false, kind: 'retryable' }
    }
    if (!places.every(isNearbyPlace)) {
      return { ok: false, kind: 'retryable' }
    }

    return { ok: true, data: { places, total } }
  } catch {
    return { ok: false, kind: 'retryable' }
  }
}
