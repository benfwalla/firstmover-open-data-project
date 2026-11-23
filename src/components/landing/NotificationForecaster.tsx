'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { Check, MagnifyingGlass, X } from '@phosphor-icons/react';
import neighborhoodData from '@/data/forecaster-neighborhoods.json';

type Neighborhood = {
  id: number;
  name: string;
  group: string | null;
  parent_id: number;
};

const neighborhoods = neighborhoodData as Neighborhood[];
const DEFAULT_NAMES = ['Tribeca', 'Kips Bay', 'Gramercy Park'];
const DEFAULT_IDS = neighborhoods
  .filter(({ name }) => DEFAULT_NAMES.includes(name))
  .map(({ id }) => id);
const BEDROOM_OPTIONS = [0, 1, 2, 3, 4] as const;
const BATHROOM_OPTIONS = [0, 1, 1.5, 2, 3] as const;

const neighborhoodById = new Map(neighborhoods.map((item) => [item.id, item]));
const childrenByParent = new Map<number, Neighborhood[]>();

for (const neighborhood of neighborhoods) {
  const siblings = childrenByParent.get(neighborhood.parent_id) || [];
  siblings.push(neighborhood);
  childrenByParent.set(neighborhood.parent_id, siblings);
}

function expandNeighborhood(id: number, visited = new Set<number>()): Neighborhood[] {
  if (visited.has(id)) return [];
  visited.add(id);

  const neighborhood = neighborhoodById.get(id);
  if (!neighborhood) return [];

  return [
    neighborhood,
    ...(childrenByParent.get(id) || []).flatMap((child) =>
      expandNeighborhood(child.id, visited),
    ),
  ];
}

function bedroomLabel(value: number) {
  if (value === 0) return 'Studio';
  if (value === 4) return '4+';
  return String(value);
}

function bathroomLabel(value: number) {
  if (value === 0) return 'Any';
  return `${value}+`;
}

export function NotificationForecaster() {
  const [selectedIds, setSelectedIds] = useState<number[]>(DEFAULT_IDS);
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('2500');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);
  const [minBathroom, setMinBathroom] = useState(0);
  const [average, setAverage] = useState<number | null>(null);
  const [hasForecast, setHasForecast] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedNeighborhoods = useMemo(
    () => selectedIds.flatMap((id) => neighborhoodById.get(id) || []),
    [selectedIds],
  );

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return neighborhoods
      .filter(
        ({ id, name }) =>
          id !== 1 &&
          !selectedIds.includes(id) &&
          name.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.name.toLowerCase().startsWith(normalizedQuery);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [query, selectedIds]);

  const reset = () => {
    setSelectedIds(DEFAULT_IDS);
    setQuery('');
    setMinPrice('2500');
    setMaxPrice('5000');
    setSelectedBedrooms([]);
    setMinBathroom(0);
    setAverage(null);
    setHasForecast(false);
    setError('');
  };

  const selectNeighborhood = (neighborhood: Neighborhood) => {
    setSelectedIds((current) => [...current, neighborhood.id]);
    setQuery('');
    setHasForecast(false);
    setError('');
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && suggestions[0]) {
      event.preventDefault();
      selectNeighborhood(suggestions[0]);
    }
  };

  const toggleBedroom = (value: number) => {
    setSelectedBedrooms((current) =>
      current.includes(value)
        ? current.filter((bedroom) => bedroom !== value)
        : [...current, value],
    );
    setHasForecast(false);
  };

  const submitForecast = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setHasForecast(false);

    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);
    if (!selectedIds.length) {
      setError('Choose at least one neighborhood.');
      return;
    }
    if (
      !Number.isInteger(parsedMinPrice) ||
      !Number.isInteger(parsedMaxPrice) ||
      parsedMinPrice < 0 ||
      parsedMaxPrice < parsedMinPrice
    ) {
      setError('Enter a maximum price that is at least your minimum price.');
      return;
    }

    const expandedNeighborhoods = [
      ...new Map(
        selectedIds
          .flatMap((id) => expandNeighborhood(id))
          .map((item) => [item.id, item]),
      ).values(),
    ].map(({ name }) => name);

    const bedroomValues = selectedBedrooms.length
      ? [
          ...new Set(
            selectedBedrooms.flatMap((value) =>
              value === 4 ? [4, 5, 6, 7, 8, 9, 10] : [value],
            ),
          ),
        ]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    setLoading(true);
    try {
      const response = await fetch('/api/notification-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhoods: expandedNeighborhoods,
          minPrice: parsedMinPrice,
          maxPrice: parsedMaxPrice,
          bedrooms: bedroomValues,
          minBathroom,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The forecast could not be loaded.');

      setAverage(payload.averageListingsPerDay);
      setHasForecast(true);
    } catch (forecastError) {
      setError(
        forecastError instanceof Error
          ? forecastError.message
          : 'The forecast could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forecaster-card">
      <div className="forecaster-card-header">
        <h3>Notification forecaster</h3>
        <button className="forecaster-reset" type="button" onClick={reset}>
          Reset
        </button>
      </div>

      <form onSubmit={submitForecast} className="forecaster-form">
        <div className="forecaster-field forecaster-neighborhood-field">
          <label htmlFor="forecaster-neighborhood">Where are you looking?</label>
          <div className="forecaster-search-wrap">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <input
              id="forecaster-neighborhood"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search neighborhoods"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="forecaster-suggestions"
            />
          </div>

          {suggestions.length > 0 && (
            <div id="forecaster-suggestions" className="forecaster-suggestions" role="listbox">
              {suggestions.map((neighborhood) => (
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  key={neighborhood.id}
                  onClick={() => selectNeighborhood(neighborhood)}
                >
                  <span>{neighborhood.name}</span>
                  {neighborhood.group && <small>{neighborhood.group}</small>}
                </button>
              ))}
            </div>
          )}

          <div className="forecaster-chips" aria-label="Selected neighborhoods">
            {selectedNeighborhoods.map((neighborhood) => (
              <span className="forecaster-chip" key={neighborhood.id}>
                {neighborhood.name}
                <button
                  type="button"
                  aria-label={`Remove ${neighborhood.name}`}
                  onClick={() => {
                    setSelectedIds((current) =>
                      current.filter((id) => id !== neighborhood.id),
                    );
                    setHasForecast(false);
                  }}
                >
                  <X size={13} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="forecaster-price-row">
          <div className="forecaster-field">
            <label htmlFor="forecaster-min-price">Minimum rent</label>
            <div className="forecaster-money-input">
              <span>$</span>
              <input
                id="forecaster-min-price"
                inputMode="numeric"
                min="0"
                step="50"
                type="number"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  setHasForecast(false);
                }}
              />
            </div>
          </div>
          <div className="forecaster-field">
            <label htmlFor="forecaster-max-price">Maximum rent</label>
            <div className="forecaster-money-input">
              <span>$</span>
              <input
                id="forecaster-max-price"
                inputMode="numeric"
                min="0"
                step="50"
                type="number"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setHasForecast(false);
                }}
              />
            </div>
          </div>
        </div>

        <fieldset className="forecaster-fieldset">
          <legend>Bedrooms</legend>
          <div className="forecaster-options">
            <button
              type="button"
              className={selectedBedrooms.length === 0 ? 'selected' : ''}
              onClick={() => {
                setSelectedBedrooms([]);
                setHasForecast(false);
              }}
            >
              Any
            </button>
            {BEDROOM_OPTIONS.map((value) => (
              <button
                type="button"
                className={selectedBedrooms.includes(value) ? 'selected' : ''}
                key={value}
                onClick={() => toggleBedroom(value)}
              >
                {selectedBedrooms.includes(value) && <Check size={13} weight="bold" />}
                {bedroomLabel(value)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="forecaster-fieldset">
          <legend>Bathrooms</legend>
          <div className="forecaster-options">
            {BATHROOM_OPTIONS.map((value) => (
              <button
                type="button"
                className={minBathroom === value ? 'selected' : ''}
                key={value}
                onClick={() => {
                  setMinBathroom(value);
                  setHasForecast(false);
                }}
              >
                {bathroomLabel(value)}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="forecaster-error" role="alert">{error}</p>}

        <button className="forecaster-submit" type="submit" disabled={loading}>
          {loading ? 'Reading the market…' : 'See my forecast'}
        </button>
      </form>

      <div className={`forecaster-result ${hasForecast ? 'visible' : ''}`} aria-live="polite">
        {hasForecast && (
          average === null ? (
            <div>
              <strong>No recent matches</strong>
              <span>Try a wider price range or nearby neighborhoods.</span>
            </div>
          ) : (
            <>
              <div className="forecaster-result-number">{average.toFixed(1)}</div>
              <div className="forecaster-result-copy">
                <strong>{average === 1 ? 'matching listing' : 'matching listings'} per day</strong>
                <span>Based on FirstMover listings from the last 14 days.</span>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
