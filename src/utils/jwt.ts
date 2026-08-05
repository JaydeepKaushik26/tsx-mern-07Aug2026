export interface AccessTokenPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

/** Decodes a JWT payload without verifying the signature -- fine on the client,
 * since the server is the only party that needs to trust the token's integrity.
 * Used here purely to read `exp` for scheduling silent refresh. */
export function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const [, payloadSegment] = token.split('.');
    const padded = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '='));
    return JSON.parse(json) as AccessTokenPayload;
  } catch {
    return null;
  }
}
