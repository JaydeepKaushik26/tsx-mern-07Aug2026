import { useCallback, useEffect, useMemo, useState } from 'react';
import { swapi, ApiError } from '../api/swapi';
import type { Film, Person, Planet, Species } from '../types/swapi';
import { extractId } from '../types/swapi';

export interface EnrichedPerson extends Person {
  speciesName: string;
  homeworldName: string;
}

interface DataState {
  people: Person[];
  species: Species[];
  planets: Planet[];
  films: Film[];
}

const PAGE_SIZE = 12;

export interface UseSwapiData {
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  allPeople: EnrichedPerson[];
  filteredPeople: EnrichedPerson[];
  pagedPeople: EnrichedPerson[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  filters: { species: string; film: string; homeworld: string };
  setFilter: (key: 'species' | 'film' | 'homeworld', value: string) => void;
  favoritesOnly: boolean;
  setFavoritesOnly: (value: boolean) => void;
  speciesOptions: { id: string; name: string }[];
  filmOptions: { id: string; name: string }[];
  homeworldOptions: { id: string; name: string }[];
  planetsById: Map<string, Planet>;
  filmsByUrl: Map<string, Film>;
}

export function useSwapiData(favoriteUrls?: Set<string>): UseSwapiData {
  const [data, setData] = useState<DataState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ species: '', film: '', homeworld: '' });
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    Promise.all([
      swapi.getPeople(controller.signal),
      swapi.getSpecies(controller.signal),
      swapi.getPlanets(controller.signal),
      swapi.getFilms(controller.signal),
    ])
      .then(([people, species, planets, films]) => {
        setData({ people, species, planets, films });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'Something went wrong while loading characters.');
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  const speciesByUrl = useMemo(() => {
    const map = new Map<string, Species>();
    data?.species.forEach((s) => map.set(s.url, s));
    return map;
  }, [data]);

  const planetsById = useMemo(() => {
    const map = new Map<string, Planet>();
    data?.planets.forEach((p) => map.set(extractId(p.url), p));
    return map;
  }, [data]);

  const filmsByUrl = useMemo(() => {
    const map = new Map<string, Film>();
    data?.films.forEach((f) => map.set(f.url, f));
    return map;
  }, [data]);

  const allPeople = useMemo<EnrichedPerson[]>(() => {
    if (!data) return [];
    return data.people.map((person) => {
      const speciesName = person.species.length
        ? speciesByUrl.get(person.species[0])?.name ?? 'Unknown'
        : 'Human';
      const homeworldName = planetsById.get(extractId(person.homeworld))?.name ?? 'Unknown';
      return { ...person, speciesName, homeworldName };
    });
  }, [data, speciesByUrl, planetsById]);

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allPeople.filter((person) => {
      if (term && !person.name.toLowerCase().includes(term)) return false;
      if (filters.species && person.speciesName !== filters.species) return false;
      if (filters.homeworld && person.homeworldName !== filters.homeworld) return false;
      if (filters.film) {
        const filmUrls = person.films;
        const matches = filmUrls.some((url) => filmsByUrl.get(url)?.title === filters.film);
        if (!matches) return false;
      }
      if (favoritesOnly && !favoriteUrls?.has(person.url)) return false;
      return true;
    });
  }, [allPeople, search, filters, filmsByUrl, favoritesOnly, favoriteUrls]);

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, filters, favoritesOnly]);

  const clampedPage = Math.min(page, totalPages);
  const pagedPeople = useMemo(
    () => filteredPeople.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE),
    [filteredPeople, clampedPage]
  );

  const speciesOptions = useMemo(() => {
    const names = new Set<string>(['Human']);
    allPeople.forEach((p) => names.add(p.speciesName));
    return Array.from(names)
      .sort()
      .map((name) => ({ id: name, name }));
  }, [allPeople]);

  const filmOptions = useMemo(
    () => (data?.films ?? []).map((f) => ({ id: f.url, name: f.title })).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const homeworldOptions = useMemo(() => {
    const names = new Set<string>();
    allPeople.forEach((p) => names.add(p.homeworldName));
    return Array.from(names)
      .sort()
      .map((name) => ({ id: name, name }));
  }, [allPeople]);

  const setFilter = useCallback((key: 'species' | 'film' | 'homeworld', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    isLoading,
    error,
    refetch,
    allPeople,
    filteredPeople,
    pagedPeople,
    page: clampedPage,
    totalPages,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    favoritesOnly,
    setFavoritesOnly,
    speciesOptions,
    filmOptions,
    homeworldOptions,
    planetsById,
    filmsByUrl,
  };
}
