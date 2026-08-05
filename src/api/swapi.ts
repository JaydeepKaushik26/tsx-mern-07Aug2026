import type { Film, Person, Planet, Species } from '../types/swapi';

const BASE_URL = 'https://swapi.info/api';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Generic fetch wrapper. swapi.info has no server-side pagination -- each
 * resource endpoint returns the full collection in a single response, so
 * pagination for the UI is implemented client-side in usePeople().
 */
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('Unable to reach the Star Wars API. Please check your connection.');
  }

  if (!response.ok) {
    throw new ApiError(`Star Wars API request failed (${response.status})`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('Received an unexpected response from the Star Wars API.');
  }
}

export const swapi = {
  getPeople: (signal?: AbortSignal) => getJson<Person[]>('/people', signal),
  getPlanets: (signal?: AbortSignal) => getJson<Planet[]>('/planets', signal),
  getFilms: (signal?: AbortSignal) => getJson<Film[]>('/films', signal),
  getSpecies: (signal?: AbortSignal) => getJson<Species[]>('/species', signal),
  getPlanet: (url: string, signal?: AbortSignal) =>
    getJson<Planet>(url.replace(BASE_URL, ''), signal),
};
