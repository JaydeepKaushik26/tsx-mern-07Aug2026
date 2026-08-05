const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface FavoriteRecord {
  characterUrl: string;
  characterName: string;
  createdAt?: string;
}

async function authedFetch(path: string, accessToken: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `Favorites request failed (${response.status})`);
  }
  return response;
}

export async function listFavorites(accessToken: string): Promise<FavoriteRecord[]> {
  const res = await authedFetch('/api/favorites', accessToken);
  return res.json();
}

export async function addFavorite(
  accessToken: string,
  characterUrl: string,
  characterName: string
): Promise<void> {
  await authedFetch('/api/favorites', accessToken, {
    method: 'POST',
    body: JSON.stringify({ characterUrl, characterName }),
  });
}

export async function removeFavorite(accessToken: string, characterUrl: string): Promise<void> {
  await authedFetch(`/api/favorites/${encodeURIComponent(characterUrl)}`, accessToken, {
    method: 'DELETE',
  });
}
