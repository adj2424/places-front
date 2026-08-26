import { lazy, Suspense, useRef, useState } from 'react'
import { findPlaces } from './places/find-places-client'
import type { FindPlacesRequest, NearbyPlace } from './places/types'
import { geocodeAddress } from './map/display-geocode'
import type { LatLng } from './map/display-geocode'
import { SearchForm } from './search/SearchForm'
import { PlaceList } from './results/PlaceList'
import type { PlaceListStatus } from './results/PlaceList'
import { DEFAULT_RADIUS_METERS } from './search/search-request'
import './App.css'

const SearchAreaMap = lazy(() => import('./map/SearchAreaMap'))

const MAP_MISS_NOTICE =
  'Could not place this address on the map. Search results are still shown.'

type SearchFlags = {
  generation: number
  placesOk: boolean | null
  nominatimMissed: boolean
}

function originFromBody(body: FindPlacesRequest): LatLng | null {
  if ('latitude' in body) {
    return { lat: body.latitude, lng: body.longitude }
  }
  return null
}

export default function App() {
  const requestGeneration = useRef(0)
  const searchFlags = useRef<SearchFlags>({
    generation: 0,
    placesOk: null,
    nominatimMissed: false,
  })
  const [status, setStatus] = useState<PlaceListStatus>('idle')
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [origin, setOrigin] = useState<LatLng | null>(null)
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS)
  const [mapNotice, setMapNotice] = useState<string | null>(null)

  function showMapMissNoticeIfSearchSucceeded(generation: number) {
    const flags = searchFlags.current
    if (flags.generation !== generation) {
      return
    }
    if (flags.placesOk === true && flags.nominatimMissed) {
      setMapNotice(MAP_MISS_NOTICE)
    }
  }

  async function handleSearch(body: FindPlacesRequest) {
    const generation = ++requestGeneration.current
    searchFlags.current = {
      generation,
      placesOk: null,
      nominatimMissed: false,
    }
    setPlaces([])
    setTotal(null)
    setStatus('loading')
    setRadiusMeters(body.radiusMeters)
    setMapNotice(null)

    const knownOrigin = originFromBody(body)
    if (knownOrigin) {
      setOrigin(knownOrigin)
    } else if ('address' in body) {
      setOrigin(null)
      void geocodeAddress(body.address).then((resolved) => {
        if (generation !== requestGeneration.current) {
          return
        }
        if (resolved) {
          setOrigin(resolved)
          return
        }
        searchFlags.current.nominatimMissed = true
        showMapMissNoticeIfSearchSucceeded(generation)
      })
    }

    const result = await findPlaces(body)
    if (generation !== requestGeneration.current) {
      return
    }

    if (!result.ok) {
      searchFlags.current.placesOk = false
      setPlaces([])
      setTotal(null)
      setStatus(result.kind === 'invalid' ? 'invalid' : 'error')
      setMapNotice(null)
      return
    }

    searchFlags.current.placesOk = true
    setPlaces(result.data.places)
    setTotal(result.data.total)
    setStatus('success')
    showMapMissNoticeIfSearchSucceeded(generation)
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Nearby explorer</h1>
        <p>Search places around an address or your current location.</p>
      </header>

      <SearchForm onSubmitSearch={handleSearch} />

      {mapNotice ? (
        <p className="app__notice" role="status">
          {mapNotice}
        </p>
      ) : null}

      <div className="app__panels">
        <Suspense
          fallback={
            <div className="search-area-map">
              <p>Loading map…</p>
            </div>
          }
        >
          <SearchAreaMap origin={origin} radiusMeters={radiusMeters} />
        </Suspense>
        <PlaceList status={status} places={places} total={total} />
      </div>
    </div>
  )
}
