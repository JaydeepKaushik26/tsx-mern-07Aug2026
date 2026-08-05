import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../services/token.service.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { AuthedRequest } from '../middleware/auth.js';

const credentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

async function issueTokenPair(userId: string, username: string) {
  const accessToken = signAccessToken({ sub: userId, username });
  const { token: refreshToken, jti } = signRefreshToken(userId);

  const decoded = jwt.decode(refreshToken) as { exp: number };
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(jti),
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { accessToken, refreshToken };
}

export async function login(req: AuthedRequest, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'Username and password are required.');

  const { username, password } = parsed.data;
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) throw new HttpError(401, 'Invalid username or password.');

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new HttpError(401, 'Invalid username or password.');

  const tokens = await issueTokenPair(user.id, user.username);
  res.json({ ...tokens, user: { id: user.id, username: user.username } });
}

export async function refresh(req: AuthedRequest, res: Response) {
  const parsed = z.object({ refreshToken: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'refreshToken is required.');

  let payload;
  try {
    payload = verifyRefreshToken(parsed.data.refreshToken);
  } catch {
    throw new HttpError(401, 'Refresh token is invalid or expired.');
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(payload.jti) });
  if (!stored || stored.revokedAt) {
    throw new HttpError(401, 'Refresh token has been revoked. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'User no longer exists.');

  // Rotate: revoke the used refresh token and issue a brand new pair.
  const tokens = await issueTokenPair(user.id, user.username);
  const newPayload = verifyRefreshToken(tokens.refreshToken);
  stored.revokedAt = new Date();
  stored.replacedByTokenHash = hashToken(newPayload.jti);
  await stored.save();

  res.json({ ...tokens, user: { id: user.id, username: user.username } });
}

export async function logout(req: AuthedRequest, res: Response) {
  const parsed = z.object({ refreshToken: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(204).end();

  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    await RefreshToken.updateOne({ tokenHash: hashToken(payload.jti) }, { revokedAt: new Date() });
  } catch {
    // Already invalid/expired -- nothing to revoke.
  }
  res.status(204).end();
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(404, 'User not found.');
  res.json({ id: user.id, username: user.username });
}
