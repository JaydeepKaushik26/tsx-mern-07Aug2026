import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { theme } from '../styles/theme';
import type { Person, Planet, Species, Film } from '../types/swapi';

const luke: Person = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.info/api/planets/1',
  films: ['https://swapi.info/api/films/1', 'https://swapi.info/api/films/2'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.info/api/people/1',
};

const tatooine: Planet = {
  name: 'Tatooine',
  rotation_period: '23',
  orbital_period: '304',
  diameter: '10465',
  climate: 'arid',
  gravity: '1 standard',
  terrain: 'desert',
  surface_water: '1',
  population: '200000',
  residents: ['https://swapi.info/api/people/1'],
  films: ['https://swapi.info/api/films/1'],
  created: '2014-12-09T13:50:49.641000Z',
  edited: '2014-12-20T20:58:18.411000Z',
  url: 'https://swapi.info/api/planets/1',
};

const film: Film = {
  title: 'A New Hope',
  episode_id: 4,
  opening_crawl: 'It is a period of civil war…',
  director: 'George Lucas',
  producer: 'Gary Kurtz, Rick McCallum',
  release_date: '1977-05-25',
  characters: ['https://swapi.info/api/people/1'],
  planets: ['https://swapi.info/api/planets/1'],
  starships: [],
  vehicles: [],
  species: [],
  created: '2014-12-10T14:23:31.880000Z',
  edited: '2014-12-20T19:49:45.256000Z',
  url: 'https://swapi.info/api/films/1',
};

const species: Species[] = [];

function mockFetchOnce() {
  return vi.fn((url: string) => {
    const path = url.replace('https://swapi.info/api', '');
    const respond = (data: unknown) =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) } as Response);

    if (path === '/people') return respond([luke]);
    if (path === '/planets') return respond([tatooine]);
    if (path === '/films') return respond([film]);
    if (path === '/species') return respond(species);
    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
}

function renderApp() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Character modal integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchOnce());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the modal with the correct character details when a card is clicked', async () => {
    const user = userEvent.setup();
    renderApp();

    const card = await screen.findByRole('button', { name: /view details for luke skywalker/i });
    await user.click(card);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();

    // Height converted to meters, mass in kg
    expect(within(dialog).getByText('1.72 m')).toBeInTheDocument();
    expect(within(dialog).getByText('77 kg')).toBeInTheDocument();
    expect(within(dialog).getByText('19BBY')).toBeInTheDocument();

    // Created date formatted as dd-MM-yyyy
    expect(within(dialog).getByText('09-12-2014')).toBeInTheDocument();

    // Film count
    expect(within(dialog).getByText('2')).toBeInTheDocument();

    // Homeworld details
    expect(within(dialog).getByText('Tatooine')).toBeInTheDocument();
    expect(within(dialog).getByText('arid')).toBeInTheDocument();
    expect(within(dialog).getByText('desert')).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    renderApp();

    const card = await screen.findByRole('button', { name: /view details for luke skywalker/i });
    await user.click(card);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
