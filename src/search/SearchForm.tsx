import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { labelForPrimaryType, PRIMARY_TYPE_KEYS } from '../places/catalog'
import {
  buildFindPlacesBody,
  DEFAULT_RADIUS_METERS,
  isValidRadius,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
} from './search-request'
import type { SearchMode } from './search-request'
import type { FindPlacesRequest } from '../places/types'

type SearchFormProps = {
  disabled?: boolean
  onSubmitSearch: (body: FindPlacesRequest) => void
}

function readRadius(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
    })
  })
}

export function SearchForm({ disabled = false, onSubmitSearch }: SearchFormProps) {
  const addressId = useId()
  const radiusId = useId()
  const [mode, setMode] = useState<SearchMode>('address')
  const [address, setAddress] = useState('')
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationDisabled, setLocationDisabled] = useState(false)
  const [locating, setLocating] = useState(false)

  const addressReady =
    mode === 'address' &&
    buildFindPlacesBody({
      mode: 'address',
      address,
      radiusMeters,
      primaryTypes: selectedTypes,
    }).ok
  const locationReady =
    mode === 'location' && !locationDisabled && isValidRadius(radiusMeters)
  const canSubmit = !disabled && !locating && (addressReady || locationReady)

  function toggleType(key: string) {
    setSelectedTypes((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
  }

  function chooseMode(next: SearchMode) {
    if (next === 'location' && locationDisabled) {
      return
    }
    setMode(next)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || locating) {
      return
    }

    if (mode === 'address') {
      const result = buildFindPlacesBody({
        mode: 'address',
        address,
        radiusMeters,
        primaryTypes: selectedTypes,
      })
      if (!result.ok) {
        return
      }
      onSubmitSearch(result.body)
      return
    }

    if (locationDisabled || !navigator.geolocation) {
      setLocationDisabled(true)
      setLocationError('Current location is unavailable in this browser.')
      setMode('address')
      return
    }

    setLocating(true)
    setLocationError(null)

    try {
      const position = await requestCurrentPosition()
      const result = buildFindPlacesBody({
        mode: 'location',
        address,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        radiusMeters,
        primaryTypes: selectedTypes,
      })
      if (!result.ok) {
        return
      }
      onSubmitSearch(result.body)
    } catch {
      setLocationDisabled(true)
      setLocationError('Location permission was denied. Use an address instead.')
      setMode('address')
    } finally {
      setLocating(false)
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <fieldset className="search-form__modes" disabled={disabled}>
        <legend className="visually-hidden">Search origin</legend>
        <label>
          <input
            type="radio"
            name="search-mode"
            value="address"
            checked={mode === 'address'}
            onChange={() => chooseMode('address')}
          />
          Address
        </label>
        <label>
          <input
            type="radio"
            name="search-mode"
            value="location"
            checked={mode === 'location'}
            disabled={locationDisabled}
            onChange={() => chooseMode('location')}
          />
          Current location
        </label>
      </fieldset>

      {locationError ? (
        <p className="search-form__notice" role="status">
          {locationError}
        </p>
      ) : null}

      <div className="search-form__row">
        <label htmlFor={addressId}>Address</label>
        <input
          id={addressId}
          type="text"
          name="address"
          autoComplete="street-address"
          value={mode === 'location' ? 'Your Location' : address}
          disabled={disabled || mode !== 'address'}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Street, city, or place"
        />
      </div>

      <div className="search-form__row">
        <label htmlFor={radiusId}>Radius (meters)</label>
        <input
          id={radiusId}
          type="number"
          name="radiusMeters"
          min={MIN_RADIUS_METERS}
          max={MAX_RADIUS_METERS}
          step={1}
          value={Number.isFinite(radiusMeters) ? radiusMeters : ''}
          disabled={disabled}
          onChange={(event) => setRadiusMeters(readRadius(event.target.value))}
        />
      </div>

      <fieldset className="search-form__types" disabled={disabled}>
        <legend>Categories (optional)</legend>
        <div className="search-form__type-grid">
          {PRIMARY_TYPE_KEYS.map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                name="primaryTypes"
                value={key}
                checked={selectedTypes.includes(key)}
                onChange={() => toggleType(key)}
              />
              {labelForPrimaryType(key)}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={!canSubmit}>
        {locating ? 'Locating…' : 'Search nearby'}
      </button>
    </form>
  )
}
