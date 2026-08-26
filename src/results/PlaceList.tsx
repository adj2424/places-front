import type { NearbyPlace } from '../places/types'

export type PlaceListStatus = 'idle' | 'loading' | 'success' | 'error'

export type PlaceListProps = {
  status: PlaceListStatus
  places: NearbyPlace[]
  total: number | null
}

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function PlaceList({ status, places, total }: PlaceListProps) {
  if (status === 'idle') {
    return (
      <section className="place-list" aria-live="polite">
        <h2>Results</h2>
        <p>Search nearby to see places here.</p>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="place-list" aria-live="polite" aria-busy="true">
        <h2>Results</h2>
        <p>Searching nearby places…</p>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="place-list" aria-live="assertive">
        <h2>Results</h2>
        <p className="place-list__error">
          Search failed. Check that Places is running and try again.
        </p>
      </section>
    )
  }

  const count = total ?? places.length

  if (places.length === 0) {
    return (
      <section className="place-list" aria-live="polite">
        <h2>Results</h2>
        <p>No places found in this area.</p>
        <p className="place-list__meta">{count} results</p>
      </section>
    )
  }

  return (
    <section className="place-list" aria-live="polite">
      <h2>Results</h2>
      <p className="place-list__meta">
        {count} {count === 1 ? 'place' : 'places'}
      </p>
      <ul>
        {places.map((place) => (
          <li key={place.id}>
            <article className="place-card">
              <h3>{place.name?.trim() || 'Unknown place'}</h3>
              {place.address ? <p>{place.address}</p> : null}
              <p className="place-card__actions">
                {place.phone ? (
                  <a href={`tel:${place.phone}`}>Call {place.phone}</a>
                ) : null}
                {place.address ? (
                  <a
                    href={mapsSearchUrl(place.address)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in maps
                  </a>
                ) : null}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
