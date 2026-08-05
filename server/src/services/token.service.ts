import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string; // user id
  username: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string; // unique token id, used to look up/revoke the stored hash
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  });
  return { token, jti };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload & jwt.JwtPayload;
}

/** Refresh tokens are hashed before being stored, the same way passwords are -- if the
 * database leaks, stored tokens alone can't be replayed against the API. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
