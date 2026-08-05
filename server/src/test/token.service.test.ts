import { describe, it, expect } from 'vitest';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../services/token.service.js';

describe('token.service', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ sub: 'user-123', username: 'lukeskywalker' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.username).toBe('lukeskywalker');
  });

  it('signs and verifies a refresh token round-trip with a unique jti', () => {
    const { token, jti } = signRefreshToken('user-123');
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.jti).toBe(jti);
  });

  it('rejects a tampered access token', () => {
    const token = signAccessToken({ sub: 'user-123', username: 'lukeskywalker' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('produces a deterministic hash for the same input', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('abd'));
  });
});
