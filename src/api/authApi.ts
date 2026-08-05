const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; username: string };
}

export class AuthApiError extends Error {}

async function post<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AuthApiError(data?.error ?? `Request to ${path} failed (${response.status})`);
  }
  return data as T;
}

export function login(username: string, password: string): Promise<AuthTokens> {
  return post<AuthTokens>('/api/auth/login', { username, password });
}

export function refresh(refreshToken: string): Promise<AuthTokens> {
  return post<AuthTokens>('/api/auth/refresh', { refreshToken });
}

export function logout(refreshToken: string): Promise<void> {
  return post<void>('/api/auth/logout', { refreshToken });
}
